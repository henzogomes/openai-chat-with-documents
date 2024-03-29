import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import createError from 'http-errors';
import indexRouter from './routes/helloWorldRouter.js';
import uploadPdfRouter from './routes/uploadPdfRouter.js'
import getEmbeddingsRouter from './routes/getEmbeddingsRouter.js';
import listDocumentsRouter from './routes/listDocumentsRouter.js';
import promptRouter from './routes/promptRouter.js';
import cors from 'cors';
import uploadJsonRouter from './routes/uploadJsonRouter.js'

const app = express();
dotenv.config(); //Reads .env file and makes it accessible via process.env

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.resolve('./public')));
app.use(cors());

// routes
app.use('/', indexRouter);
app.use('/pdf', uploadPdfRouter);
app.use('/embeddings', getEmbeddingsRouter);
app.use('/list', listDocumentsRouter);
app.use('/prompt', promptRouter);
app.use('/json', uploadJsonRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at ${process.env.PORT}`);
});


export default app;
