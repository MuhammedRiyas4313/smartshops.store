const mongoose = require("mongoose");
require("dotenv").config();

const url = process.env.URL;

mongoose.set("strictQuery", false);
mongoose
  .connect(url, { useNewUrlParser: true })
  .then(() => {
    console.log("connected");
  })
  .catch((error) => {
    console.log("error occured", error);
  });
