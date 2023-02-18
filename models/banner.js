const mongoose = require("mongoose");
const moment = require("moment");

const bannerSchema = new mongoose.Schema({
   
    image:String,
    title:String,
    subtitle:String,
    status:{
      type:Boolean,
      default:true
    },
    updated:{ type: Date, default: moment(Date.now()).format("DD MMM YYYY")},
    created:{ type: Date, default: moment(Date.now()).format("DD MMM YYYY")}
  });
  
  module.exports = Banner = mongoose.model('banner', bannerSchema);