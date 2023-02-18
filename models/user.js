const mongoose = require('mongoose');
const moment = require("moment");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  mobile: {
    type: Number,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  status:{
    type: Boolean, 
    default: true
  },
  created: {
    type: Date,
    default: moment(Date.now()).format("DD MMM YYYY")
  },
});

module.exports = User = mongoose.model('user', UserSchema);
