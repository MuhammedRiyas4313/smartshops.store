const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const db = require("./config/db");
const Handlebars = require('handlebars')
const hbs = require('express-handlebars');
const hbshelpers = require('handlebars-helpers');
const multihelpers = hbshelpers();
const { helpersDM } = require('./helpers/handlebar')
const { err } = require("./middlewares/errorHandler");

const { appMiddleware, errorHandler } = require("./middlewares/appmiddlewares");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "sessionkey",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 600000000 * 30 },
  })
);

app.use(appMiddleware);
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
app.engine('hbs', hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout',partialsDir:__dirname+'/views/partials', helpers: {...multihelpers, ...helpersDM }, handlebars: allowInsecurePrototypeAccess(Handlebars) }))
app.set("view engine", "hbs");

const indexRouter = require("./routes/users");
const adminRouter = require("./routes/admin");



app.use("/admin", adminRouter);
app.use("/", indexRouter);

app.use(function (req, res, next) {
  const error = new Error(`Not found ${req.originalUrl}`);
  if (req.originalUrl.startsWith("/admin")) {
      error.admin = true;
  }
  error.status = 404;
  next(error);
});

app.use(err);



module.exports = app;
