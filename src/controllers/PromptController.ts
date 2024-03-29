import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { DocumentsControllerHelper, vectorToString } from './DocumentsController.js';
import { encode } from 'gpt-tokenizer';
import stripIndent from 'strip-indent';
import { Configuration, OpenAIApi } from 'openai';

export class PromptController {
  async getEmbeddings(text: string): Promise<string> {
    const embeddings = new OpenAIEmbeddings();
    const embeddingsResult = await embeddings.embedQuery(text);

    const embeddingsAsString = vectorToString(embeddingsResult);

    return embeddingsAsString;
  }

  async run(queryText: string, document_name: string) {
    const openaiKey = process.env.OPENAI_API_KEY;

    if (openaiKey === '' || openaiKey === undefined) {
      throw new Error('OPENAI_API_KEY environment variable not set');
    }

    //get embedding vectors
    const promptEmbeddings = await this.getEmbeddings(queryText);

    //search database for matching content
    const _Document = new DocumentsControllerHelper();
    const documents = await _Document.getMatchingDocuments(
      promptEmbeddings,
      document_name,
    );
    let tokenCount = 0;
    let contextText = '';

    const configuration = new Configuration({
      apiKey: openaiKey,
    });
    const openai = new OpenAIApi(configuration);

    // Concat matched documents
    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];
      const content = document[0];
      const encoded = encode(content);
      tokenCount += encoded.length;

      // Limit context to max 2500 tokens (configurable)
      if (tokenCount > 2500) {
        break;
      }

      contextText += `${content.trim()}\n---\n`;
    }

    const prompt = stripIndent(`
      You are a question and answer representative who loves
      to help people! Given the following sections from a document, answer
      the question using only that information. If you are unsure and the answer
      is not explicitly written in the documentation, say
      "Sorry, I don't know how to help with that."

      Context sections:
      ${contextText}

      Question: """
      ${queryText}
      """
    `);

    const completionResponse = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 1024, // Choose the max allowed tokens in completion
      temperature: .5, // Set to 0 for deterministic results
    });

    const {
      choices: [{ text }],
    } = completionResponse.data;

    return text;
  }
}
