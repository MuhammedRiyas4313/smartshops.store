const mongoose = require("mongoose");

const url = "mongodb://127.0.0.1:27017/smartshop";

mongoose.set("strictQuery", false);
mongoose
  .connect(url, { useNewUrlParser: true })
  .then(() => {
    console.log("connected");
  })
  .catch((error) => {
    console.log("error occured", error);
  });
