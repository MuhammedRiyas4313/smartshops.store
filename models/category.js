const mongoose = require("mongoose");
const moment = require("moment");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type:String,
    required:true
  },
  updated:{ type: Date, default: moment(Date.now()).format("DD MMM YYYY") },
  created:{ type: Date, default: moment(Date.now()).format("DD MMM YYYY") }
});

Category  =  mongoose.model("Category", CategorySchema);

module.exports = Category ;
