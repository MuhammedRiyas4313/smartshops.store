const mongoose = require("mongoose");
const moment = require("moment");

const CouponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  startdate: {
    type: Date,
    required: true,
  },
  enddate: {
    type: Date,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
  },
  amount: {
    type: Number,
  },
  minspend: {
    type: Number,
    default:200
  },
  maxdiscount: {
    type: Number
  },
  used: {
    type: Number,
    default: 0,
  },
  percustomer: {
    type: Number,
  },
  status:{
    type:Boolean,
    default:true
  },
  created:{
    type:Date,
    default: moment(Date.now()).format("DD MMM YYYY")
  },
  couponPurchased:[
    {
      redeemer:{
       type: mongoose.Schema.Types.ObjectId, 
      ref:"user"    
     },
     count:Number
    }
  ],

});

module.exports = Coupon = mongoose.model("coupon", CouponSchema);
