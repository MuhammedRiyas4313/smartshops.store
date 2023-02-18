const mongoose = require("mongoose");
const User = require("./user");
const moment = require("moment");

const AddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  addresses: [
    {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      phone: {
        type: Number,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      created:{
        type:Date,
        default:Date.now()
      },
      updated:{
        type:Date,
        default:Date.now()
      }
    },
  ],
  created:{
    type:Date,
    default: moment(Date.now()).format("DD MMM YYYY")
  }
});

module.exports = Address = mongoose.model("address", AddressSchema);
