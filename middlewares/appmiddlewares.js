const createError = require("http-errors");
const express = require("express");

const nocache = require("nocache");
const app = express();

const appMiddleware = (req, res, next) => {
  app.use(nocache());
  next();
};



module.exports = {
  appMiddleware,
};
