var express = require('express');
var router = express.Router();
const { userSession, userSessionAxios } = require('../middlewares/usersession');
const counts = require('../middlewares/counts')
const {
         home,
         loginPage,
         otpPage,
         otpConfirm,
         shop,
         productDetails,
         profile,
         signUpConfirm,
         loginVerify,
         logOut,
         addToCart,
         cart,
         cartProductQuantity,
         cartItemRemove,
         checkout,
         address,
         applyCoupon,
         order,
         orderReview,
         wishlist,
         addToWishlist,
         removeWishlistItem,
         editAddress,
         updateAddress,
         deleteAddress,
         orders,
         orderDetails,
         createorder,
         orderCancel,
         profileAddress,
         searchProducts,
               } =require('../controllers/users');


            //    const check = (req,res,next) => {
            //       console.log(req.query.id,"req is now in the middleware processing")
            //       next();
            //    }

/* GET users page. */

router.get('/',counts, home);
router.get('/user-login',loginPage)
router.post('/user/login-verify',loginVerify)
router.get('/user/logout',logOut)
router.post('/user-otp',otpPage)
router.post('/user/otp-confirm',otpConfirm)
router.get('/shop/:id',counts,shop)
router.get('/user/product-details/:id',counts,productDetails)
router.get('/search-products',counts,searchProducts)
router.get('/user-profile',userSession,counts,profile)
router.get('/profile-address',userSession,counts,profileAddress)
router.post('/user/signup-confirm',signUpConfirm)
router.post('/cart/:id',userSessionAxios,counts,addToCart)
router.get('/cart',userSession,counts,cart)
router.get('/wishlist',userSession,counts,wishlist)
router.post('/wishlist',userSessionAxios,counts,addToWishlist)
router.delete('/wishlist',userSessionAxios,counts,removeWishlistItem)
router.patch('/cart',userSessionAxios,counts,cartProductQuantity)
router.delete('/cart',userSessionAxios,counts,cartItemRemove)
router.get('/checkout',userSession,counts,checkout)
router.post('/address',userSession,counts,address)
router.get('/address',userSessionAxios,counts,editAddress)
router.put('/address',userSessionAxios,counts,updateAddress)
router.delete('/address',userSessionAxios,counts,deleteAddress)
router.post('/coupon',userSessionAxios,counts,applyCoupon)
router.post('/order',userSession,counts,order)
router.get('/order-review',userSession,counts,orderReview)
router.post('/create-order',userSession,counts,createorder)
router.get('/orders',userSession,counts,orders)
router.get('/order-details',userSession,counts,orderDetails)
router.patch('/order-cancel',userSession,counts,orderCancel)




module.exports = router;
