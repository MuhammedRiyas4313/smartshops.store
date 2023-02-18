
const moment = require('moment')


const helpersDM = {
  equal:function(a,b, options) {
    if (a == b) {
      return options.fn(this);
    }else{
      return options.inverse(this);
    }
  },
  formatDate:function(date){
    return moment(date).format('DD MMM YYYY');
  },
  sliceid:function(id){
    return id.toString("").slice(0, 6)
  }
};
  
  module.exports = { helpersDM };