const mongoose = require("mongoose");
require("dotenv").config();

const RIYA = process.env.URL;

console.log(RIYA,'url from the db...')

mongoose.set("strictQuery", false);
mongoose.connect(RIYA,{ useNewUrlParser: true })
  .then(() => {
    console.log("connected");
  })
  .catch((error) => {
    console.log("error occured", error);
  });
