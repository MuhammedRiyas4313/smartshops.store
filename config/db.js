const mongoose = require("mongoose");
require("dotenv").config();

const URL = process.env.URL;

mongoose.set("strictQuery", false);
mongoose
  .connect(URL, { useNewUrlParser: true })
  .then(() => {
    console.log("connected");
  })
  .catch((error) => {
    console.log("error occured", error);
  });
