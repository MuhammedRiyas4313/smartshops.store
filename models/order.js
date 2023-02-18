const mongoose = require("mongoose");
const moment = require("moment");

const OrderSchema = new mongoose.Schema({
  orderID:String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  billingAddress:{
    type: Object
  },
  items: [{
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
  }],
  subtotal:Number,
  discountAmount:Number,
  total:Number ,
  paymentMethod: String,
  paymentDetails: Object,
  date: { type: Date, default: moment(Date.now()).format("DD MMM YYYY") },
  status:String,
  couponDetails:Object
});

module.exports = Order = mongoose.model("order", OrderSchema);
