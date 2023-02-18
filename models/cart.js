const mongoose = require("mongoose");
const User = require("../models/user");
const Product = require("../models/product");
const moment = require("moment");

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
      productPrice:{
        type:Number
      },
      quantity: {
        type: Number,
      },
      totalprice:Number,
      created:{ type: Date, default: moment(Date.now()).format("DD MMM YYYY") }
    },
  ],
  productsCount:{
    type:Number,
    default:0
  } ,
  grandTotal:{
    type:Number,
    default:0
  },
  date: {
    type: Date,
    default: moment(Date.now()).format("DD MMM YYYY")
  },
});

module.exports = Cart = mongoose.model("cart", CartSchema);
