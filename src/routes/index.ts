import express from "express";

let router = express.Router();

router.get('/', function(req, res, next) {
  let msg: string = 'hi';
  res.send(msg);
});

export default router;
