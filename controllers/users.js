const bcrypt = require("bcrypt");
const twilio = require("twilio");
require("dotenv").config();
const { ObjectId } = require("mongodb");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const { isEmail } = require('../helpers/userHelper')

const User = require("../models/user");
const Product = require("../models/product");
const Category = require("../models/category");
const Cart = require("../models/cart");
const Address = require("../models/address");
const Coupon = require("../models/coupon");
const Order = require("../models/order");
const Wishlist = require("../models/wishlist");
const paypal = require("@paypal/checkout-server-sdk");
const Banner = require("../models/banner");

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const ACCOUNT_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SERVICE_ID = process.env.TWILIO_SERVICE_ID;

const envirolment = process.env.NODE_ENV === "production" ? paypal.core.LiveEnvironment : paypal.core.SandboxEnvironment;

const paypalCliend = new paypal.core.PayPalHttpClient(new envirolment(  process.env.PAYPAL_CLIENT_ID,  process.env.PAYPAL_CLIENT_SECRET ));

const client = new twilio(ACCOUNT_SID, ACCOUNT_AUTH_TOKEN);
const serviceid = SERVICE_ID;

//=======================================/Home-pag/==============================================//

const home = async (req, res) => {
  console.log("user at home ");
  const { logeduser, cartItemCount, wishtListCount } = req.session; //user _id
  console.log(logeduser, "loged user");
  try {
    const banner = await Banner.findOne({status:true});
    console.log(banner,'banner from the banner........')
    const productslist = await Product.find({}).sort({ created: -1 });
    const categorylist = await Category.find({});
    if (productslist && categorylist) {
      if (logeduser) {
        res.render("user_home", {
          user: true,
          logeduser,
          productslist,
          categorylist,
          cartItemCount,
          wishtListCount,
          banner
        });
      } else {
        res.render("user_home", {
          user: true,
          productslist,
          categorylist,
          banner
        });
      }
    } else {
      res.render("user_home", {
        user: true,
        banner
      });
    }
  } catch (error) {
    console.log(error.message, "error from the catch home........");
    next(error);
  }
};

//=======================================/Login-page/==============================================//

const loginPage = (req, res) => {
  try {
    res.render("user_login",{userlogin:true});
  } catch (error) {
    console.log(error.message, "error in login page");
    next(error);
  }
};

//=======================================/Login-verification/==============================================//

const loginVerify = async (req, res) => {
  try {
    const { userlogid, userlogpassword } = req.body;
  console.log("verifying");
  req.session.limit = 0
  console.log(++req.session.limit)
  if (userlogid.length == 10) {

    const founduser = await User.findOne({ mobile: userlogid });

    if (founduser) {
      
      if (founduser.status) {
        const { password } = founduser;
        try {
          await bcrypt.compare(userlogpassword, password, (err, data) => {
            if (err) {
              res.json({ message: "Oops Some thing error !" });
            } else if (data) {
              req.session.logeduser = founduser;

              res.json({ message: "user logged" });
            } else {
              res.json({ message: "Incorrect password !" });
            }
          });
        } catch (error) {
          console.log(error.message, "error in the login confirm"); // redirect to an error page or login page ?
        }
      } else {
        res.json({ message: "Account has been blocked !" });
      }
    } else {
      res.json({ message: "Cant find user !" });
    }
  } else {
    res.json({ message: "Mobile number should be 10 digits !" });
  }
  } catch (error) {
    next(error);
  }
};

//=======================================/Mobile-confirm/==============================================//

//==============================================/otp-page/==============================================//

const otpPage = async (req, res) => {
  
  
  try {

    console.log(req.body,'req.body modal')

    const { newusermobile,type } = req.body;

    
      if( req.session.limit > 1 ){
          if(newusermobile == req.session.newUserMobile){
            res.json({ message: "Try again later!" });
          }else{
            req.session.limit = 0;
          }
      }else{

        console.log('else in otp......',newusermobile)

            if(newusermobile == req.session.newUserMobile){

              req.session.limit ++;

            }else{
              req.session.newUserMobile = newusermobile
              req.session.limit = 0;
            }

            let existance = null;

            if(type == 'reset'){

              const resetUser = await User.findOne({mobile:newusermobile})
                    if(!resetUser){
                      res.json({message:"User not exist !"})
                    } else {
                      req.session.forgotUser = true;
                      existance = null;
                    
                    }
            }else{
              existance = await User.findOne({ mobile: newusermobile });
            }
          if (!existance) {

            console.log(req.session.newUserMobile,'session value')
            console.log(newusermobile,'newusermobile value')

            if ( newusermobile || req.session.newUserMobile ) {
              
              console.log(newusermobile.length,req.session.newUserMobile.length,'lengthssss')
              if ( newusermobile.length == 10 || req.session.newUserMobile.length == 10 ) {
                let userMobile;
                if(req.session.newUserMobile){
                  userMobile = req.session.newUserMobile
                }else if (type == 'reset'){

                 
                    console.log(type,'type of req....')
                    
                  

                }else{
                  userMobile = newusermobile
                }

                await client.verify.v2
                  .services(serviceid)
                  .verifications.create({
                    to: `+91${userMobile}`,
                    channel: "sms",
                  })
                  .then((verification) => {
                    res.json({
                      message: "success",
                      type: "mobileverified",
                    });
                  });
              } else {
                res.json({ message: "Mobile should be 10 digits!" });
              }
            } else {
              res.json({ message: "Mobile cant be empty!" });
            }
          } else {
            res.json({
              message: "Mobile already registered!",
            });
          }

     }

    console.log(newusermobile,'newuser mobile..................')
  
  } catch (error) {
    //try another mobile number
    res.json({ message: "Oops something wrong!" });
    console.error(error,'error from the otp page ')
    next(error);
  }
};

//=======================================/enterOtp/==============================================//

//=======================================/OTP-confirm/==============================================//

const otpConfirm = async (req, res) => {
  try {
    const { enteredotp } = req.body;
    const { newUserMobile } = req.session;

    if (enteredotp) {
      if (enteredotp.length == 6) {
        await client.verify.v2
          .services(serviceid)
          .verificationChecks.create({
            to: `+91${newUserMobile}`,
            code: enteredotp,
          })
          .then((verification_check) => {
            if (verification_check.status == "approved") {
              if(req.session.forgotUser){

                res.json({ message: "resetSuccess" });

              }else{

                res.json({ message:"success"});

              }
              
            } else {
              res.json({ message: "Invalid OTP!" });
            }
          })
          .catch((err) => {
            console.error(err.message, "error in twilio");
            //otp validation failed twilio
            res.json({ message: "Oops validation failed" });
          });
      } else {
        //otp should be six s
        res.json({ message: "OTP must be 6 digits!" });
      }
    } else {
      res.json({ message: "OTP Cant be empty!" });
    }
  } catch (error) {
    //otp validation failed twilio
    res.json({ message: "Oops validation failed" });
    next(error);
  }
};

//=======================================/Sign-Up/==============================================//



//=======================================/SignUp-Confirm/==============================================//

const signUpConfirm = async (req, res) => {
  try {
    const { username, userpassword, useremail, userconfirmpassword, type } = req.body;

    if(req.session.forgotUser && type == "reset"){

      if(userpassword == userconfirmpassword){

        const bcryptpassword = await bcrypt.hash(userpassword, 10);
        await User.findOneAndUpdate({mobile:req.session.newUserMobile},{$set:{password:bcryptpassword}}).then((data)=>{
          res.json({message:"resetSuccess"})
        }).catch((err)=>{
          console.error(err.message,'error from forgot password..')
        })

      }else{
        res.json({message:"Passwords should be same !"})
      }

    }else{

      if(userpassword == userconfirmpassword){

        if( username == '' || userpassword == '' || userconfirmpassword == '' || useremail == '' ){
          res.json({message:"Please fill required fields !"})
        }else{
  
            if (isEmail(useremail)) {
                  let { newUserMobile } = req.session;
                  const bcryptpassword = await bcrypt.hash(userpassword, 10);
                  console.log(req.body, newUserMobile, "new user data");
                  await User.create(
                    {
                      name: username,
                      email: useremail,
                      mobile: newUserMobile,
                      password: bcryptpassword,
                      status: true,
                      created: Date.now(),
                    },
                    (err) => {
                      if (err) {
                        res.json({ message: "email already used!" });
                      } else {
                        res.json({ message: "success" });
                      }
                    }
                );
            } else {
              res.json({message:"Enter a valid email !"})
            }
        }
        
      }else{
        res.json({message:"Passwords should be same !"})
      }

    }

    
  } catch (error) {
    console.log(error.message, "error in signup confirm ");
    next(error);
  }
};

//=======================================/Cart/==============================================//

const cart = async (req, res) => {
  try {
    const { logeduser, cartItemCount, wishtListCount, quantityCheck } =
      req.session;
    const userCart = await Cart.findOne({
      user: ObjectId(logeduser._id),
    }).populate("items.product", "image name price quantity");
    console.log(quantityCheck, "quantity check");
    if (userCart) {
      res.render("user_cart", {
        logeduser,
        userCart,
        user: true,
        cartItemCount,
        wishtListCount,
        quantityCheck,
      });
      req.session.quantityCheck = [];
    } else {
      // userCart.grandTotal = 0;
      res.render("user_cart", {
        logeduser,
        userCart,
        user: true,
        cartItemCount,
        wishtListCount,
      });
    }
  } catch (error) {
    console.log(error.message, "error in showing the cart ");
    next(error);
    //upadation need
  }
};

//=======================================/Add-to-cart/==============================================///

const addToCart = async (req, res) => {
  console.log("function is calling from the axios wishlist");
  const { id } = req.params; //product id
  const { logeduser } = req.session;
  const { size, color, price } = req.body; //size and color not used now
  const product = await Product.findOne({ _id: ObjectId(id) });
  const checkcartexist = await Cart.findOne({ user: ObjectId(logeduser._id) });
  if (product.quantity < 1) {
    res.json({ message: "Out of stock !" });
  } else {
    if (!checkcartexist) {
      console.log("user dont have an cart ");
      try {
        await Cart.create(
          {
            user: ObjectId(logeduser._id),
            items: [
              {
                product: ObjectId(id),
                productPrice: price,
                quantity: 1,
                totalprice: price,
              },
            ],
            productsCount: 1,
            grandTotal: price,
          },
          (err) => {
            if (err) {
              console.log(err.message, " cant add product to the cart ");
              res.json({ message: "Oops something wrong!" }); ///////////////// required
            } else {
              res.json({ message: "Added to cart" });
            }
          }
        );
      } catch (error) {
        console.log(error.message, "create cart failed its from the catch block");
        next(error);
      }
    } else {
      try {
        const cartItem = await Cart.findOne({
          $and: [
            { user: ObjectId(logeduser._id) },
            { "items.product": ObjectId(id) },
          ],
        });
        if (!cartItem) {
          const updateCart = await Cart.updateOne(
            { user: ObjectId(logeduser._id) },
            {
              $push: {
                items: {
                  $each: [
                    {
                      product: ObjectId(id),
                      productPrice: price,
                      quantity: 1,
                      totalprice: price,
                    },
                  ],
                  $position: 0,
                },
              },
              $inc: { productsCount: 1, grandTotal: price },
            }
          );
          if (updateCart.nModified !== 0) {
            res.json({ message: "Added to cart" });
          } else {
            res.json({ message: "Oops something wrong!" });
          }
        } else {
          const index = checkcartexist.items.findIndex(
            (obj) => obj.product == id
          );
          const itemCount = checkcartexist.items[index].quantity;
          if (product.quantity > itemCount) {
            const updateCart = await Cart.updateOne(
              {
                $and: [
                  { user: ObjectId(logeduser._id) },
                  { "items.product": ObjectId(id) },
                ],
              },
              {
                $inc: {
                  "items.$.quantity": 1,
                  "items.$.totalprice": price,
                  productsCount: 1,
                  grandTotal: price,
                },
              }
            );
            if (updateCart.nModified !== 0) {
              res.json({ message: "Added to cart" });
            } else {
              res.json({ message: "Oops something wrong!" });
            }
          } else {
            res.json({ message: "Out of stock !" });
          }
        }
      } catch (error) {
        console.log(
          error.message,
          "error message in the cart existing product adding"
        );
        res.json({ message: "Oops something wrong!" }); // required handle the try catch block
        next(error);
      }
    }
  }
};

//=======================================/Cart-product-quantity/==============================================//

const cartProductQuantity = async (req, res) => {
  console.log("function called for the quantity manipulatae");
  try {
    const { itemDocId, price, method } = req.body;

    let { logeduser } = req.session;
    const productPrice = parseInt(price);
    const userCart = await Cart.findOne({ user: ObjectId(logeduser._id) });
    const index = userCart.items.findIndex((obj) => obj._id == itemDocId);
    const cartItem = userCart.items[index];
    const productId = cartItem.product;
    const itemCount = cartItem.quantity;
    const product = await Product.findOne({ _id: ObjectId(productId) });
    if (method == "increment") {
      if (product.quantity <= itemCount) {
        res.json({ message: "Product is out of stock" });
      } else {
        const updateCart = await Cart.updateOne(
          {
            $and: [
              { user: ObjectId(logeduser._id) },
              { "items._id": ObjectId(itemDocId) },
            ],
          },
          {
            $inc: {
              "items.$.quantity": 1,
              "items.$.totalprice": productPrice,
              productsCount: 1,
              grandTotal: productPrice,
            },
          }
        );
        if (updateCart.nModified !== 0) {
          const newCart = await Cart.findOne({ user: ObjectId(logeduser._id) });
          const updatedProduct = newCart.items[index];
          updatedProduct.grandtotal = newCart.grandTotal;
          req.session.couponApplied = false;
          const data = {
            message: "incremented",
            item: updatedProduct,
            grandtotal: newCart.grandTotal,
          };
          res.json(data);
        } else {
          res.json({ message: "failed increment" });
        }
      }
    } else if (method == "decrement") {
      const updateCart = await Cart.updateOne(
        {
          $and: [
            { user: ObjectId(logeduser._id) },
            { "items._id": ObjectId(itemDocId) },
          ],
        },
        {
          $inc: {
            "items.$.quantity": -1,
            "items.$.totalprice": -productPrice,
            productsCount: -1,
            grandTotal: -productPrice,
          },
        }
      );
      if (updateCart.nModified !== 0) {
        const newCart = await Cart.findOne({
          $and: [
            { user: ObjectId(logeduser._id) },
            { "items._id": ObjectId(itemDocId) },
          ],
        });
        req.session.couponApplied = false;
        const updatedProduct = newCart.items[index];
        const data = {
          message: "decremented",
          item: updatedProduct,
          grandtotal: newCart.grandTotal,
        };
        res.json(data);
      } else {
        res.json({ message: "failed decrement" });
      }
    }
  } catch (error) {
    console.log(error.message, "error in the cart product quantity increment ");
    next(error);
  }
};

//=======================================/Cart Item delete/==============================================//

const cartItemRemove = async (req, res) => {
  try {
    const { id } = req.query;
    const { logeduser } = req.session;
    const userCart = await Cart.findOne({ user: ObjectId(logeduser._id) });
    const index = userCart.items.findIndex((obj) => obj._id == id);
    const product = userCart.items[index];
    const totalPrice = product.totalprice;
    const quantity = product.quantity;
    const result = await Cart.updateOne(
      { user: logeduser._id },
      {
        $pull: { items: { _id: ObjectId(id) } },
        $inc: { grandTotal: -totalPrice, productsCount: -quantity },
      }
    );
    if (result.nModified !== 0) {
      const newCart = await Cart.findOne({ user: ObjectId(logeduser._id) });
      const grandTotal = newCart.grandTotal;
      const productCount = newCart.productsCount;
      req.session.couponApplied = false;
      const data = {
        success: true,
        grandtotal: grandTotal,
        productcount: productCount,
      };
      res.json(data);
    } else {
      res.send({ updateerror: true });
    }
  } catch (err) {
    console.log(err.message, "error in cath cart item remove");
    res.send({ catcherror: true });
    next(error);
  }
};

//=======================================/Wishlist/==============================================//

const wishlist = async (req, res) => {
  try {
    const { logeduser, cartItemCount, wishtListCount } = req.session;
    const userWishlist = await Wishlist.findOne({
      user: ObjectId(logeduser._id),
    })
      .populate("items.product", "image name price _id")
      .sort({ "items.created": -1 });
    res.render("user_wishlist", {
      user: true,
      logeduser,
      userWishlist,
      cartItemCount,
      wishtListCount,
    });
  } catch (error) {
    console.log(error.message, "error in wishlist .....");
    next(error);
  }
};

//=======================================/Add to Wishlist/==============================================//

const addToWishlist = async (req, res) => {
  const { id } = req.query;
  try {
    const { logeduser } = req.session;
    const userWishlist = await Wishlist.findOne({
      user: ObjectId(logeduser._id),
    });
    if (!userWishlist) {
      Wishlist.create(
        {
          user: ObjectId(logeduser._id),
          items: [
            {
              product: ObjectId(id),
            },
          ],
        },
        (err) => {
          if (err) {
            console.log(err.message, "error in creating wishlist");
          } else {
            res.json({
              message: "Added to wishlist",
              updated: true,
            });
          }
        }
      );
    } else {
      const existProduct = await Wishlist.findOne({
        $and: [
          { user: ObjectId(logeduser._id) },
          { "items.product": ObjectId(id) },
        ],
      });
      if (!existProduct) {
        const updatedWishlist = await Wishlist.updateOne(
          { user: ObjectId(logeduser._id) },
          {
            $push: {
              items: { $each: [{ product: ObjectId(id) }], $position: 0 },
            },
            $inc: { count: 1 },
          }
        );
        if (updatedWishlist.nModified == 0) {
          res.json({
            message: "Oops something wrong !",
            updated: false,
          });
        } else {
          res.json({
            message: "Added to wishlist",
            updated: true,
          });
        }
      } else {
        res.json({
          message: "Product already exist !",
          updated: false,
        });
      }
    }
  } catch (error) {
    console.log(error.message, "error occured in the whishlist");
    next(error);
  }
};

//=======================================/Wishlist delete item/=============================================//

const removeWishlistItem = async (req, res) => {
  console.log("for remove wishlist item .......");
  try {
    const { id } = req.query;
    const { logeduser } = req.session;
    const result = await Wishlist.updateOne(
      { user: logeduser._id },
      { $pull: { items: { _id: ObjectId(id) } }, $inc: { count: -1 } }
    );
    if (result.nModified === 0) {
      res.send({
        updateerror: true,
      });
    } else {
      const userWishlist = await Wishlist.findOne({
        user: ObjectId(logeduser._id),
      });
      res.send({
        success: true,
        count: userWishlist.count,
      });
    }
  } catch (error) {
    console.log(error.message, "error in remove from wishlist");
    next(error);
  }
};

//=======================================/Shop/==============================================//

const shop = async (req, res) => {
  const { id } = req.params;
  const { logeduser, cartItemCount, wishtListCount } = req.session;
  try {
    let categorylist = await Category.find({});
    console.log(
      categorylist,
      "from the shop function it is category list latest"
    );

    if (id == "all") {
      let productlist = await Product.find({}).sort({ updated: -1 });
      res.render("user_shop", {
        productlist,
        categorylist,
        user: true,
        logeduser,
        cartItemCount,
        wishtListCount,
      });
    } else {
      let productlist = await Product.find({ category: ObjectId(id) }).sort({
        updated: -1,
      });
      res.render("user_shop", {
        productlist,
        categorylist,
        user: true,
        logeduser,
        cartItemCount,
        wishtListCount,
      });
    }
  } catch (error) {
    console.log("error in shop ");
    next(error);
  }
};

//=======================================/Product-details/==============================================//

const productDetails = async (req, res) => {
  try {
    const { id } = req.params; // => product id
    const { outofstock, logeduser, cartItemCount, wishtListCount } =
      req.session;
    const product = await Product.findOne({ _id: ObjectId(id) });
    req.session.temp = product._id;
    const categoryid = product.category;
    const relatedProducts = await Product.find({
      $and: [
        { category: ObjectId(categoryid) },
        { _id: { $ne: ObjectId(id) } },
      ],
    }).limit(6);
    let categorylist = await Category.find({}).limit(5);
    if (logeduser) {
      const cart = await Cart.findOne({ user: ObjectId(logeduser._id) });
      res.render("user_product_details", {
        user: true,
        product,
        relatedProducts,
        messageoutofstock: outofstock,
        categorylist,
        logeduser,
        cart,
        cartItemCount,
        wishtListCount,
      });
      req.session.outofstock = false;
    } else {
      res.render("user_product_details", {
        user: true,
        product,
        relatedProducts,
        categorylist,
        logeduser,
      });
    }
  } catch (error) {
    console.log(error.message, "error in the product details");
    const { temp } = req.session;
    if (temp) {
      res.redirect(`/user/product-details/${temp}`);
    } else {
      res.redirect("/shop/all");
    }
    //////////////need updation
    next(error);
  }
};

//=======================================/Product-details/==============================================//

const searchProducts = async (req, res) => {
  try {
    const { id } = req.query;
    const regex = new RegExp(`^${id}`, "i");

    if (id) {
      const searchCategory = await Category.findOne({
        name: { $regex: regex },
      });
      if (searchCategory) {
        productslist = await Product.find({
          category: { $eq: ObjectId(searchCategory._id) },
        }).sort({ created: -1 });
        res.json(productslist);
      } else {
        productslist = await Product.find({ name: { $regex: regex } }).sort({
          created: -1,
        });
        res.json(productslist);
      }
    } else {
      productslist = await Product.find({}).sort({ created: -1 });
      res.json(productslist);
    }
  } catch (error) {
    console.error(error, "error in the search products");
    next(error);
  }
};

//=======================================/Checkout/==============================================//

const checkout = async (req, res) => {
  try {
    const {
      logeduser,
      discountamount,
      discountedTotal,
      cartItemCount,
      wishtListCount,
      couponApplied,
    } = req.session;
    console.log(couponApplied,discountedTotal)
    const cartItems = await Cart.aggregate([
      { $match: { user: ObjectId(logeduser._id) } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDocument",
        },
      },
    ]);
    console.log(cartItems, "cart items result of the unwind & lookup");
    const quantityCheck = cartItems.reduce((acc, curr) => {
      if (curr.productDocument[0].quantity < curr.items.quantity) {
        console.log("item is out of stock");
        acc.push(curr.productDocument[0].name);
      }
      return acc;
    }, []);
    console.log(quantityCheck);
    if (quantityCheck.length == 0) {
      const userCart = await Cart.findOne({ user: logeduser._id });
      const subtotal = userCart.grandTotal;
      const paypalclientid = process.env.PAYPAL_CLIENT_ID;
      console.log(paypalclientid, "client id");
      let total;
      let discount;
      if (discountedTotal && couponApplied) {
        req.session.couponApplied = false;
        total = discountedTotal;
        discount = parseInt(discountamount) 
      } else {
        total = subtotal;
        discount = 0;
      }
      console.log(subtotal, "subtotal from the grandTotal");
      const address = await Address.findOne({ user: ObjectId(logeduser._id) });
      res.render("shop-checkout-address", {
        user: true,
        address,
        logeduser,
        subtotal,
        discount,
        total,
        cartItemCount,
        wishtListCount,
        paypalclientid,
      });
      req.session.discountamount = 0;
      req.session.discountedTotal = 0;
      req.session.usedCode = null;
    } else {
      console.log(quantityCheck, "no stock products from cart to checkout");
      req.session.quantityCheck = quantityCheck;
      res.redirect("/cart");
    }
  } catch (error) {
    console.log(error.message, "error occured in checkout ........");
    next(error);
  }
};

//=======================================/Address/==============================================//

const address = async (req, res) => {
  try {
    const { logeduser } = req.session;
    const {
      name,
      address,
      street,
      city,
      state,
      pincode,
      country,
      phone,
      email,
    } = req.body;
    const addressCollection = await Address.findOne({
      user: ObjectId(logeduser._id),
    });
    if (!addressCollection) {
      await Address.create(
        {
          user: ObjectId(logeduser._id),
          addresses: [
            {
              name: name,
              address: address,
              street: street,
              city: city,
              state: state,
              pincode: pincode,
              country: country,
              phone: phone,
              email: email,
            },
          ],
        },
        async (err) => {
          if (err) {
            console.log(err.message, "err in create new address");
          } else {
            const newAdd = await Address.findOne({
              user: ObjectId(logeduser._id),
            });
            res.json(newAdd);
          }
        }
      );
    } else {
      const addAddress = await Address.updateOne(
        { user: ObjectId(logeduser._id) },
        {
          $push: {
            addresses: {
              $each: [
                {
                  name: name,
                  address: address,
                  street: street,
                  city: city,
                  state: state,
                  pincode: pincode,
                  country: country,
                  phone: phone,
                  email: email,
                },
              ],
              $position: 0,
            },
          },
        }
      );
      if (addAddress.nModified == 0) {
        console.log(addAddress, "result");
        console.log(" cant update add anotheer adderess");
      } else {
        const newAdd = await Address.findOne({ user: ObjectId(logeduser._id) });
        console.log(newAdd, "after add new in array ");
        res.json(newAdd);
      }
    }
  } catch (err) {
    res.redirect(`/checkout`);
    console.log(
      err.message,
      "error tried to handled in the catch block from the address function "
    );
    next(error);
  }
};

//=======================================/Edit-address/==============================================//

const editAddress = async (req, res) => {
  console.log("function is calling axioss....");
  try {
    const { id } = req.query;
    const { logeduser } = req.session;
    console.log(id, "id from the axios call.");
    const address = await Address.findOne(
      { "addresses._id": ObjectId(id) },
      { "addresses.$": 1 }
    );
    console.log(address);
    res.json(address);
  } catch (error) {
    console.log(error.message, "error message from the edit address");
    next(error);
  }
};

//=======================================/Update address/==============================================//

const updateAddress = async (req, res) => {
  console.log(req.body, "axios is calling");
  try {
    const {
      _id,
      name,
      email,
      phone,
      state,
      country,
      city,
      pincode,
      street,
      address,
    } = req.body;
    const { logeduser } = req.session;
    const updatedAddress = await Address.updateOne(
      {
        $and: [
          { user: ObjectId(logeduser._id) },
          { "addresses._id": ObjectId(_id) },
        ],
      },
      {
        "addresses.$.name": name,
        "addresses.$.address": address,
        "addresses.$.street": street,
        "addresses.$.city": city,
        "addresses.$.state": state,
        "addresses.$.pincode": pincode,
        "addresses.$.country": country,
        "addresses.$.phone": phone,
        "addresses.$.email": email,
        "addresses.$.updated": Date.now(),
      }
    );
    if (updatedAddress.nModified !== 0) {
      const afterUpdation = await Address.findOne({
        user: ObjectId(logeduser._id),
      });
      res.json(afterUpdation);
    } else {
      res.json({ message: "updation failed" });
    }
  } catch (error) {
    console.log(error.message, "error in the update address");
    next(error);
  }
};

//=======================================/Delete address/==============================================//

const deleteAddress = async (req, res) => {
  const { id } = req.query;
  const { logeduser } = req.session;
  try {
    const dltAddress = await Address.updateOne(
      {
        $and: [
          { user: ObjectId(logeduser._id) },
          { "addresses._id": ObjectId(id) },
        ],
      },
      {
        $pull: {
          addresses: {
            _id: ObjectId(id),
          },
        },
      }
    );
    if (dltAddress.nModified !== 0) {
      const addressDeleted = await Address.findOne({
        user: ObjectId(logeduser._id),
      });
      res.json(addressDeleted);
    } else {
      console.log("cant update....addresss");
    }
  } catch (error) {
    console.log(error.message, "error in the delete address");
    next(error);
  }
};

//=======================================/Apply-Coupon/==============================================//

const applyCoupon = async (req, res) => {
  try {
    const { logeduser, usedCode } = req.session;
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code });
    const userCart = await Cart.findOne({ user: ObjectId(logeduser._id) });
    if (userCart) {
      const items = userCart.items;
      if (items.length) {
        const total = userCart.grandTotal;

        if (coupon) {
          const {
            _id,
            startdate,
            enddate,
            status,
            percustomer,
            minspend,
            maxdiscount,
            amount,
            quantity,
            used,
            redeemed,
            percentage,
          } = coupon;
          console.log(
            minspend,
            ": minspend",
            "total:",
            total,
            "from start",
            "condition :",
            minspend && minspend < total
          );
          const currentDate = new Date(Date.now());
          const redeemedUsers = coupon.couponPurchased;
          let redeemedCheck = false;
          for (let i = 0; i < redeemedUsers.length; i++) {
            if (logeduser._id == redeemedUsers[i].redeemer) {
              redeemedCheck = true;
              break;
            }
          }
          if (redeemedCheck) {
            res.json({
              message: "Already used!",
              discountedtotal: total,
              discountamount: 0,
              applied: false,
            });
          } else if (total - amount < 100) {
            res.json({
              message: "Cant apply coupon !",
              discountedtotal: total,
              discountamount: 0,
              applied: false,
            });
          } else if (total == 0) {
            res.json({
              message: "No items found in cart !",
              discountedtotal: 0,
              discountamount: 0,
              applied: false,
            });
          } else if (startdate > currentDate) {
            res.json({
              message: "Coming soon !",
              discountedtotal: total,
              discountamount: 0,
              applied: false,
            });
          } else if (usedCode == code) {
            req.session.usedCode = code;
            let discount;
            if (amount) {
              req.session.discountamount = amount;
              discountedTotal = total - amount;
              req.session.discountedTotal = discountedTotal;
              discount = amount;
            } else if (percentage) {
              discount = total * (percentage / 100);
              discountedTotal = parseInt(total - total * (percentage / 100));
              req.session.discountedTotal = discountedTotal
            }
            req.session.couponApplied = true;
            res.json({
              message: "Already applied coupon",
              discountedtotal: discountedTotal,
              discountamount: discount,
              applied: false,
            });
          } else if (currentDate > enddate) {
            res.json({
              message: "expired coupon",
              discountedtotal: total,
              discountamount: 0,
              applied: false,
            });
          } else if (!status) {
            res.json({
              message: "currently unavailable",
              discountedtotal: total,
              discountamount: 0,
              applied: false,
            });
          } else if (percustomer && percustomer <= redeemed) {
            res.json({
              message: "limit exceed",
              discountedtotal: total,
              discountamount: 0,
              applied: false,
            });
          } else if (minspend && minspend > total) {
            console.log(minspend, ": minspend", "total:", total);
            res.json({
              message: `Minimum spend ${minspend}$ required `,
              discountedtotal: total,
              discountamount: 0,
              applied: false,
            });
          } else if (maxdiscount && maxdiscount > total) {
            res.json({
              message: "exceed amount",
              discountedtotal: total,
              discountamount: 0,
              applied: false,
            });
          } else if (quantity <= used) {
            res.json({
              message: "better luck next time",
              discountedtotal: total,
              discountamount: 0,
              applied: false,
            });
          } else if (amount) {
            req.session.couponApplied = true
            req.session.usedCode = code;
            req.session.discountamount = amount;
            discountedTotal = total - amount;
            req.session.discountedTotal = discountedTotal;
            console.log(req.session.discountedTotal, "discounted total");
            res.json({
              message: "Coupon applied",
              discountedtotal: discountedTotal,
              discountamount: amount,
              applied: true,
            });
          } else if (percentage) {
            req.session.couponApplied = true
            req.session.usedCode = code;
            req.session.discountamount = parseInt(total * (percentage / 100));
            req.session.discountedTotal = parseInt( total - (total * (percentage / 100)));
            console.log(req.session.discountedTotal,req.session.discountamount, "discounted total");
            res.json({
              message: "Coupon applied",
              discountedtotal: req.session.discountedTotal,
              discountamount: req.session.discountamount,
              applied: true,
            });
          }
        } else {
          res.json({
            message: "invalid code",
            discountedtotal: total,
            discountamount: 0,
            applied: false,
          });
        }
      } else {
        res.json({
          message: "Your cart is empty!",
          discountedtotal: 0,
          discountamount: 0,
          applied: false,
        });
      }
    } else {
      res.json({
        message: "Your cart is empty!",
        discountedtotal: 0,
        discountamount: 0,
        applied: false,
      });
    }
  } catch (error) {
    console.log(error.message, "error from the apply coupon");
    next(error);
  }
};

//=======================================/Order/==============================================//

const order = (req, res) => {
 try {
  console.log(req.body, "from the checkout page ...........");
  req.session.order = req.body;
  res.send({ success: true });
 } catch (error) {
  next(error);
 }
};
//=======================================/Order-review/==============================================//

const orderReview = async (req, res) => {
  console.log("order about to order.......");
  try {
    const { method, add, details } = req.session.order;
    const {
      discountedTotal,
      usedCode,
      logeduser,
      cartItemCount,
      wishtListCount,
      discountamount,
    } = req.session;

    let productsPrice;
    let discount;
    let paymentDetails;
    let couponDetails;

    if (method == "onlinepayment") {
      const { payer, purchase_units, id } = details;

      paymentDetails = {
        id: id,
        first_name: payer.name.given_name,
        last_name: payer.name.surname,
        email: payer.email_address,
        payerID: payer.payer_id,
        currency: purchase_units[0].payments.captures[0].amount.currency_code,
        amount: purchase_units[0].payments.captures[0].amount.value,
        create: purchase_units[0].payments.captures[0].create_time,
        status: purchase_units[0].payments.captures[0].status,
        transactionID: purchase_units[0].payments.captures[0].id,
        payee_email: purchase_units[0].payee.email_address,
        payee_merchantID: purchase_units[0].payee.merchant_id,
      };
    } else {
      paymentDetails = {
        status: "PENDING",
      };
    }

    const cartItems = await Cart.findOne({ user: ObjectId(logeduser._id) });
    const orderedItems = cartItems.items;
    const subtotal = cartItems.grandTotal;
    const billedAddress = await Address.findOne(
      { "addresses._id": ObjectId(add) },
      { "addresses.$": 1 }
    );

    if (discountedTotal && usedCode) {
      productsPrice = discountedTotal;
      discount = discountamount;
      couponDetails = {
        code: usedCode,
        discount: discount,
      };
    } else {
      productsPrice = cartItems.grandTotal;
      discount = 0;
      couponDetails = {
        code: "no coupon",
        discount: discount,
      };
    }

    const ID = `SP${uuidv4().replace(/-/g, "").slice(0, 10)}`.toUpperCase();

    await Order.create(
      {
        orderID: ID,
        user: ObjectId(logeduser._id),
        billingAddress: billedAddress,
        subtotal: subtotal,
        discountAmount: discount,
        total: productsPrice,
        paymentMethod: method,
        paymentDetails: paymentDetails,
        items: orderedItems,
        date: Date.now(),
        status: "Confirmed",
        couponDetails: couponDetails,
      },
      async (err) => {
        if (err) {
          console.log(err.message, "error in place order ");
        } else {
          const updateCoupon = await Coupon.updateOne(
            { code: usedCode },
            {
              $push: {
                couponPurchased: {
                  $each: [
                    {
                      redeemer: ObjectId(logeduser._id),
                    },
                  ],
                  $position: 0,
                },
              },
              $inc: { used: 1 },
            }
          );
          console.log(updateCoupon, "updated coupon");
          await Cart.updateOne(
            { user: ObjectId(logeduser._id) },
            { items: [], productsCount: 0, grandTotal: 0 }
          );

          for (let i = 0; i < orderedItems.length; i++) {
            let id = orderedItems[i].product;
            let quantity = orderedItems[i].quantity;
            await Product.updateOne(
              { _id: ObjectId(id) },
              { $inc: { quantity: -quantity }, updated: Date.now() }
            );
          }

          const latestOrder = await Order.findOne({ orderID: ID });

          req.session.discountedTotal = 0;

          res.render("user_order_review", {
            user: true,
            logeduser,
            cartItemCount,
            wishtListCount,
            latestOrder,
          });
        }
      }
    );
  } catch (error) {
    console.log(error.message, "error occured in the order function");
    next(error);
  }
};

//=======================================/Orders/==============================================//

const orders = async (req, res) => {
  try {
    const { wishtListCount, cartItemCount, logeduser } = req.session;
    const orders = await Order.find({ user: ObjectId(logeduser._id) }).sort({
      date: -1,
    });

    const orderList = orders.reduce((acc, curr) => {
      const datas = {
        _id: curr._id,
        orderID: curr.orderID,
        user: curr.user,
        billingAddress: curr.billingAddress,
        items: curr.items,
        total: curr.total,
        paymentMethod: curr.paymentMethod,
        date: moment(curr.date).format("DD MMM YYYY"),
        status: curr.status,
      };
      acc.push(datas);
      return acc;
    }, []);

    console.log(orderList, "orderlist.............");
    res.render("user_account_orders", {
      user: true,
      logeduser,
      wishtListCount,
      cartItemCount,
      orderList,
    });
  } catch (error) {
    console.error(error.message, "error in the orders list");
    next(error);
  }
};

//=======================================/Online-payment/==============================================//

const createorder = async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest();

  const balance = req.body.items[0].amount;
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: balance,
        },
      },
    ],
  });
  try {
    const order = await paypalCliend.execute(request);
    res.json({ id: order.result.id });
  } catch (error) {
    console.log(error.message, "error in create order");
    next(error);
  }
};

//=======================================/Order-Details/==============================================//

const orderDetails = async (req, res) => {
  try {
    const { logeduser, cartItemCount, wishtListCount } = req.session;
    const { id } = req.query;
    const trackOrder = await Order.findOne({ _id: ObjectId(id) }).populate(
      "items.product",
      "name image price"
    );
    const billingAddress = trackOrder.billingAddress.addresses;
    let originalDate = new Date(moment(trackOrder.date).format("DD MMM YYYY"));
    let newDate = moment(
      new Date(originalDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    ).format("DD MMM YYYY");
    res.render("user_single_order", {
      user: true,
      logeduser,
      trackOrder,
      billingAddress,
      newDate,
      cartItemCount,
      wishtListCount,
    });
  } catch (error) {
    console.error(error, "error from the order datails");
    next(error);
  }
};

//=======================================/Order-cancel/==============================================//

const orderCancel = async (req, res) => {
  const { id } = req.query;
  const { logeduser } = req.session;

  try {
    const orderToCancel = await Order.findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: { status: "Canceled" } }
    );

    console.log(orderToCancel, "after updation order status");
    const items = orderToCancel.items;

    for (let i = 0; i < items.length; i++) {
      let id = items[i].product;
      let quantity = items[i].quantity;
      await Product.updateOne(
        { _id: ObjectId(id) },
        { $inc: { quantity: quantity }, updated: Date.now() }
      );
    }

    const couponCode = orderToCancel.couponDetails.code;

    if (couponCode !== "no coupon") {
      const updateCoupon = await Coupon.updateOne(
        { code: couponCode },
        {
          $pull: { couponPurchased: { redeemer: ObjectId(logeduser._id) } },
          $inc: { used: -1 },
        }
      );
    }

    res.json({ message: "Order canceled" });
  } catch (error) {
    console.error(error, "error in the order cancelation");
    next(error);
  }
};

//=======================================/User-Profile/==============================================//

const profile = async (req, res) => {
  try {
    const { logeduser, cartItemCount, wishtListCount } = req.session;
    console.log(logeduser.created, "logeduser created ///");

    console.log(logeduser.created, "date from the user profile");
    let createddate = moment(logeduser.created).format("MMM DD, YYYY ");

    console.log(createddate, "created from the user profile");
    logeduser.created = createddate;
    console.log(logeduser.created, "modified date from moment");
    res.render("user_profile", {
      logeduser,
      user: true,
      cartItemCount,
      wishtListCount,
    });
  } catch (error) {
    console.log(error.message, "error occured in userprofile");
    next(error);
  }
};

//=======================================/User-Profile-Address/==============================================//

const profileAddress = async (req, res) => {
  try {
    const { logeduser, cartItemCount, wishtListCount } = req.session;
    const address = await Address.findOne({ user: ObjectId(logeduser._id) });
    res.render("user_account_address", {
      user: true,
      cartItemCount,
      wishtListCount,
      logeduser,
      address,
    });
  } catch (error) {
    console.error(error, "error from the profile address");
    next(error);
  }
};

//=======================================/Login-Out/==============================================//

const logOut = (req, res) => {
  try {
    req.session.destroy();
  res.redirect("/");
  } catch (error) {
    next(error);
  }
};

//=======================================/Login-Out/==============================================//



//=======================================/END/==============================================//

module.exports = {
  home,
  loginPage,
  loginVerify,
  otpPage,
  otpConfirm,
  shop,
  productDetails,
  profile,
  signUpConfirm,
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
};
