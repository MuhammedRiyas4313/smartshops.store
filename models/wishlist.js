const mongoose = require('mongoose');
const User = require('../models/user');
const Product = require('../models/product');
const moment = require("moment");

const WishListSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
    created: { type: Date, default: moment(Date.now()).format("DD MMM YYYY") }
  }],
  count:{
    type:Number,
    default:1
  }
});

module.exports = WishList = mongoose.model('wishlist', WishListSchema);