const mongoose = require("mongoose");
const Category = require("./category");
const moment = require("moment");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description:{
    type:String,
    required:true
  } ,
  price: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref:Category
  },
  image: {
   type: Array,
   required: true
  },
  updated:{ type: Date, default: moment(Date.now()).format("DD MMM YYYY")},
  created:{ type: Date, default: moment(Date.now()).format("DD MMM YYYY")}
});

module.exports = Product = mongoose.model("product", ProductSchema);
