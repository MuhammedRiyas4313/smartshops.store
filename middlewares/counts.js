const Cart = require("../models/cart");
const Wishlist = require("../models/wishlist");
const { ObjectId } = require("mongodb");

const counts = async (req, res, next) => {
  try {
    const { logeduser } = req.session;
    if (logeduser) {
      let cartItemCount;
      let wishtListCount;
      const usercart = await Cart.findOne({ user: ObjectId(logeduser._id) });
      const wishtList = await Wishlist.findOne({user: ObjectId(logeduser._id)});
      console.log(usercart, "user cart from the counts");
      if (usercart) {
        console.log('enter in the cart condition ')
        cartItemCount = usercart.productsCount;
        req.session.cartItemCount = cartItemCount;
      } else{
        req.session.cartItemCount = 0;
      }
      if (wishtList) {
        console.log('enter in the wishlist condition ')
        wishtListCount = wishtList.count;
        req.session.wishtListCount = wishtListCount;
      } else {
        req.session.wishtListCount = 0;  
      }
      next();

    } else {
      req.session.wishtListCount = 0;
      req.session.cartItemCount = 0;
      next();
    }
  } catch (error) {
    console.log(error.message, "error in counts middleware");
  }
};

module.exports = counts;
