require("dotenv").config();
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const moment = require("moment");
const Category = require("../models/category");
const Product = require("../models/product");
const User = require("../models/user");
const Coupon = require("../models/coupon");
const Cart = require("../models/cart");
const Order = require("../models/order");
const Banner = require("../models/banner");

const passwordsaved = process.env.ADMIN_PASSWORD;
const email = process.env.ADMIN_EMAIL;

const login = async (req, res) => {
  try {
    let { logerror, loged, adminlostsession } = req.session;
    if (loged) {
      const usercount = await User.count({});
      res.render("admin_home", { usercount, admin: true });
    } else {
      res.render("admin_login", {
        message: logerror,
        messageadmin: adminlostsession,
        adminlogin: true,
      });
      req.session.logerror = false;
      req.session.adminlostsession = false;
    }
  } catch (error) {
    console.log(error.message, "error occured in the login");
    error.admin = true;
        next(error);
  }
};

const home = async (req, res) => {
  try {
    const { password, username } = req.body;
    if (password == passwordsaved && username == email) {
      req.session.loged = true;
      res.redirect("/admin");
    } else {
      req.session.logerror = true;
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message, "error occured in the home ");
    error.admin = true;
        next(error);
  }
};

const categories = async (req, res) => {
  try {
    let { deletecaterror, deletecatsuccess } = req.session;
    let data = await Category.find({}).sort({ updated: -1 });
    const categorylist = data.reduce((acc, curr) => {
      const datas = {
        _id: curr._id,
        id: curr._id.toString("").slice(0, 6),
        name: curr.name,
        description: curr.description,
        created: moment(curr.created).format("DD MMM YYYY"),
      };
      acc.push(datas);
      return acc;
    }, []);
    res.render("admin_category", {
      admin: true,
      categorylist,
      messageE: deletecaterror,
      messageS: deletecatsuccess,
    });
    deletecaterror = false;
    deletecatsuccess = false;
  } catch (error) {
    console.log(error.message, "error occured in the categories");
    error.admin = true;
        next(error);
  }
};

const addCategory = (req, res) => {
  try {
    let { addcaterror, addcatsuccess, existcategory } = req.session;
    res.render("admin_add_category", {
      admin: true,
      messageE: addcaterror,
      messageS: addcatsuccess,
      messageEX: existcategory,
    });
    req.session.addcaterror = false;
    req.session.addcatsuccess = false;
    req.session.reqexistcategory = false;
  } catch (error) {
    console.log(error.message, "error occured in the addcategory");
    error.admin = true;
        next(error);
  }
};

const submitCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const regex = new RegExp(`^${name}`, "i");
    if (name) {
      const foundcategory = await Category.findOne({ name: { $regex: regex } });
      if (foundcategory) {
        res.send({ exist: true });
        req.session.existcategory = true;
      } else {
        await Category.create(
          {
            name: name,
            description: description,
          },
          (err) => {
            if (err) {
              req.session.addcaterror = true;
              res.send({ added: false });
            } else {
              req.session.addcatsuccess = true;
              res.send({ added: true });
            }
          }
        );
      }
    } else {
      res.send({ required: true });
      req.session.addcaterror = true;
    }
  } catch (error) {
    console.log(error.message, "error occured in the submitcategory function");
    error.admin = true;
        next(error);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.query; //cat id to delete
    const result = await Category.deleteOne({ _id: ObjectId(id) });
    if (result.deletedCount === 0) {
      res.send({ deleteerror: true });
    } else {
      await Product.deleteMany({ category: ObjectId(id) }).then((respons) => {
        console.log("products too deleted");
        success = true;
        res.send({ success });
      });
    }
  } catch (error) {
    console.log(err.message, "error occured in the delete category ");
    res.send({ catcherror: true });
    error.admin = true;
        next(error);
  }
};

const products = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      deleteproducterror,
      deleteproductsuccess,
      productupdatesuccess,
      productupdateerror,
    } = req.session;
    let categorisedproducts = [];
    let categoryList = [];
    if (id === "all") {
      req.session.currentcategory = true;
      categorisedproducts = await Product.find({}).sort({ updated: -1 });
      categoryList = await Category.find({});
    } else {
      req.session.currentcategory = false;
      categorisedproducts = await Product.find({ category: ObjectId(id) }).sort(
        { updated: -1 }
      );
      categoryList = await Category.find({});
      
    }
    res.render("admin_products", {
      admin: true,
      categorisedproducts,
      categoryList,
      messageproductdeleteerror: deleteproducterror,
      messageproductdeleted: deleteproductsuccess,
      messageproductupdated: productupdatesuccess,
      messageproductupdaterror: productupdateerror,
    });
    req.session.deleteproducterror = false;
    req.session.deleteproductsuccess = false;
    req.session.productupdateerror = false;
    req.session.productupdatesuccess = false;
  } catch (error) {
    console.log(error.message, "error occured in the products");
    error.admin = true;
        next(error);
  }
};

const addProduct = async (req, res) => {
  try {
    let { productadderror, productaddsuccess } = req.session;
    let categorylist = await Category.find({});
    res.render("admin_add_product", {
      admin: true,
      categorylist,
      messagePE: productadderror,
      messagePS: productaddsuccess,
    });
    req.session.productadderror = false;
    req.session.productaddsuccess = false;
  } catch (error) {
    console.log(error.message, "error occured in the addproduct");
    error.admin = true;
        next(error);
  }
};

const submitProduct = async (req, res) => {
  try {
    const images = req.files.map((img) => img.filename); //to filter file name from the array.consist lot of files
   
    const {
      productname,
      productdescription,
      productprice,
      productcolor,
      productsize,
      productcategory,
      productquantity,
    } = req.body;
    await Product.create(
      {
        name: productname,
        description: productdescription,
        price: productprice,
        color: productcolor,
        size: productsize,
        quantity: productquantity,
        category: ObjectId(productcategory),
        image: images,
      },
      (err) => {
        if (err) {
          console.log("error in product adding ", err.message);
          req.session.productadderror = true;
          res.redirect("/admin/product");
        } else {
          req.session.productaddsuccess = true;
          res.redirect("/admin/product");
        }
      }
    );
  } catch (error) {
    console.log(error.message, "error occured in the submit product");
    error.admin = true;
        next(error);
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    req.session.producttoupdate = id;
    const foundproduct = await Product.findOne({
      _id: ObjectId(id),
    });
    const foundcategory = await Category.findOne({
      _id: ObjectId(foundproduct.category),
    });
    const categorylist = await Category.find({});
    if (foundproduct) {
      res.render("admin_edit_product", {
        admin: true,
        foundproduct,
        categorylist,
        foundcategory,
      });
    }
  } catch (error) {
    req.session.productediterror = true;
    res.redirect("/admin/products/all");
    console.log(error.message, "error occured in the edit product");
    error.admin = true;
        next(error);
  }
};

const updateProduct = async (req, res) => {
  try {

    console.log(req.body,'req.body,. data...........')
    
    const images = req.files.map((img) => img.filename); //to filter file name from the array.consist lot of files
    console.log(images,"images");
    const { producttoupdate } = req.session;
    const {
      productname,
      productdescription,
      productprice,
      productcolor,
      productsize,
      productcategory,
      productquantity,
      positions
    } = req.body;
    const product  = await Product.findOne({_id: ObjectId(producttoupdate)})
    const productImage = product.image
    let newImagePositions = JSON.parse(positions)


    console.log(productImage,'product image before update .........')
    console.log(typeof(newImagePositions),'type of positions.........')
    console.log(newImagePositions.length,'type of positions.........')
    
   for (let i = 0 ; i < newImagePositions.length ; i ++){
      
        productImage[newImagePositions[i]] = images[i]
   }


    await Product.updateOne(
      { _id: ObjectId(producttoupdate) },
      {
        name: productname,
        description: productdescription,
        price: productprice,
        color: productcolor,
        size: productsize,
        quantity: productquantity,
        category: ObjectId(productcategory),
        image:productImage,
        updated: Date.now(),
      }
    )
      .then((e) => {
        req.session.productupdatesuccess = true;
        res.status(200);
        res.send("success");
      })
      .catch((err) => {
        req.session.productupdateerror = true;
        res.send("failed");
      });
  } catch (error) {
    req.session.productupdateerror = true;
    res.send("error");
    console.log(error.message, "error occured in the update product");
    error.admin = true;
        next(error);
  }
};

const deleteProduct = async (req, res) => {
  console.log("aaaaaaaaaaa........");
  try {
    const { id } = req.query;
    const result = await Product.deleteOne({ _id: ObjectId(id) });
    if (result.deletedCount === 0) {
      res.send({ deleteerror: true });
    } else {
      res.send({ success: true });
    }
  } catch (error) {
    res.send({ catcherror: true });
    console.log(err.message, "error occured in the delete product");
    error.admin = true;
        next(error);
  }
};

const users = async (req, res) => {
  try {
    let {
      userblockerror,
      userblocked,
      userunblockerror,
      userunblocked,
      deleteusererror,
      deleteusersuccess,
    } = req.session;
    const data = await User.find({}).sort({ created: -1 });
    let count = 0;
    const userslist = data.reduce((acc, curr) => {
      count++;
      const datas = {
        _id: curr._id,
        id: curr._id.toString("").slice(0, 6),
        name: curr.name,
        mobile: curr.mobile,
        status: curr.status,
        created: moment(curr.created).format("DD MMM YYYY"),
        sno: count,
      };
      acc.push(datas);
      return acc;
    }, []);
    res.render("admin_users", {
      admin: true,
      userslist,
      messageBE: userblockerror,
      messageBS: userblocked,
      messageUE: userunblockerror,
      messageUS: userunblocked,
      messageDE: deleteusererror,
      messageDS: deleteusersuccess,
    });
    req.session.userblockerror = false;
    req.session.userblocked = false;
    req.session.userunblockerror = false;
    req.session.userunblocked = false;
    req.session.deleteusererror = false;
    req.session.deleteusersuccess = false;
  } catch (error) {
    console.log(error.message, "error occured in the users");
    error.admin = true;
        next(error);
  }
};

const userStatus = async (req, res) => {
  try {
    const user = req.params.id;
    const userstatus = await User.findOne({ _id: ObjectId(user) });
    if (userstatus.status) {
      const blockeduser = await User.updateOne(
        { _id: ObjectId(user) },
        { $set: { status: false } }
      );
      if (blockeduser.nModified === 0) {
        res.send({ blockerror: true });
      } else {
        res.send({ blocksuccess: true });
      }
    } else {
      const unblockeduser = await User.updateOne(
        { _id: ObjectId(user) },
        { $set: { status: true } }
      );
      if (unblockeduser.nModified === 0) {
        res.send({ unblockerror: true });
      } else {
        res.send({ unblocksuccess: true });
      }
    }
  } catch (err) {
    res.send({ catcherror: true });
    error.admin = true;
        next(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await User.deleteOne({ _id: ObjectId(id) });
    if (result.deletedCount === 0) {
      res.send({ deleteerror: true });
    } else {
      res.send({ deletesuccess: true });
    }
  } catch (err) {
    res.send({ catcherror: true });
    error.admin = true;
        next(error);
  }
};

const coupons = async (req, res) => {
  try {
    const { couponadded, couponadderror } = req.session;
    const couponslist = await Coupon.find({}).sort({ created: -1 });
    console.log(couponslist, "");
    let count = 0;
    let couponStatus;
    const couponList = couponslist.reduce((acc, curr) => {
      count++;
      const percentage = (curr.used / curr.quantity) * 100;
      const newDate = Date.now();
      const expDate = curr.enddate;
      if (newDate > expDate) {
        couponStatus = false;
      } else {
        couponStatus = true;
      }
      const datas = {
        sno: count,
        _id: curr._id,
        id: curr._id.toString("").slice(0, 6),
        name: curr.name,
        startdate: moment(curr.startdate).format("DD MMM YYYY"),
        enddate: moment(curr.enddate).format("DD MMM YYYY"),
        quantity: curr.quantity,
        used: curr.used,
        code: curr.code,
        validity: couponStatus,
        percentage: percentage,
        status: curr.status,
      };
      acc.push(datas);
      return acc;
    }, []);
    res.render("coupons", { couponList, couponadded, couponadderror });
    req.session.couponadded = false;
    req.session.couponadderror = false;
  } catch (error) {
    console.log(error.message, "error occured in the coupons");
    error.admin = true;
        next(error);
  }
};

const createCoupon = async (req, res) => {
  
  try {
    res.render("admin_create_coupon");
  } catch (error) {
    error.admin = true;
        next(error);
  }
};

const submitCoupon = async (req, res) => {
  try {
    const {
      name,
      code,
      startdate,
      enddate,
      quantity,
      percentage,
      amount,
      minspend,
      maxspend,
      percustomer,
    } = req.body;

    await Coupon.create(
      {
        name: name,
        code: code,
        startdate: startdate,
        enddate: enddate,
        quantity: quantity,
        percentage: percentage,
        amount: amount,
        minspend: minspend,
        maxdiscount: maxspend,
        used: 0,
        percustomer: percustomer,
      },
      (err) => {
        if (err) {
          req.session.couponadderror = true;
          res.redirect("/admin/coupons");
        } else {
          req.session.couponadded = true;
          res.redirect("/admin/coupons");
        }
      }
    );
  } catch (error) {
    console.log(error.message, "error occured in the submit coupon");
    error.admin = true;
        next(error);
  }
};

const couponStatus = async (req, res) => {
  const { id } = req.params; //coupon id
  try {
    const couponstatus = await Coupon.findOne({ _id: ObjectId(id) });
    if (couponstatus.status) {
      const blockedcoupon = await Coupon.updateOne(
        { _id: ObjectId(id) },
        { $set: { status: false } }
      );
      if (blockedcoupon.nModified === 0) {
        res.send({ blockerror: true });
      } else {
        res.send({ blocksuccess: true });
      }
    } else {
      const unblockedcoupon = await Coupon.updateOne(
        { _id: ObjectId(id) },
        { $set: { status: true } }
      );
      if (unblockedcoupon.nModified === 0) {
        res.send({ unblockerror: true });
      } else {
        res.send({ unblocksuccess: true });
      }
    }
  } catch (err) {
    res.send({ catcherror: true });
    console.log(err.message, "error occured in the coupon status");
    error.admin = true;
        next(error);
  }
};

const couponDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Coupon.deleteOne({ _id: ObjectId(id) });
    if (result.deletedCount === 0) {
      res.send({ deleteerror: true });
    } else {
      res.send({ deletesuccess: true });
    }
  } catch (error) {
    res.send({ catcherror: true });
    console.error(err, "error in coupon delete");
    error.admin = true;
        next(error);
  }
};

const orders = async (req, res) => {
  try {
    const ordersList = await Order.find({})
      .populate("user", "name")
      .sort({ date: -1 });
    console.log(ordersList, "orders list admin");
    res.render("admin_orders", { admin: true, ordersList });
    console.log(ordersList, "orders admin");
  } catch (error) {
    console.error(error, "error in the orders");
    error.admin = true;
        next(error);
  }
};

const orderDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const orderDetails = await Order.findOne({ _id: ObjectId(id) })
      .populate("user")
      .populate("items.product");

    res.render("admin_order_details", { admin: true, orderDetails });
    console.log(orderDetails, "order details");
  } catch (error) {
    console.error(error, "error in the order details");
    error.admin = true;
        next(error);
  }
};

const orderStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const { orderstatus, paymentstatus } = req.body;
    const { logeduser } = req.session;
    console.log(
      orderstatus,
      ": orderstatus",
      paymentstatus,
      ": payment status"
    );

    if (orderstatus == "Canceled") {
      const orderToCancel = await Order.findOneAndUpdate(
        { _id: ObjectId(id) },
        { $set: { status: "Canceled" } },
        { new: true }
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

      const updatedOrder = {
        orderstatus: orderToCancel.status,
        paymentstatus: orderToCancel.paymentDetails.status,
        updated: true,
      };
      console.log(orderToCancel, "user order  after updation");
      res.json(updatedOrder);
    } else {
      const userOrder = await Order.findOneAndUpdate(
        { _id: ObjectId(id) },
        {
          $set: { status: orderstatus, "paymentDetails.status": paymentstatus },
        },
        { new: true }
      );
      console.log(userOrder, "userorder in  status updater");
      const updatedOrder = {
        _id: userOrder._id,
        orderstatus: userOrder.status,
        paymentstatus: userOrder.paymentDetails.status,
        updated: true,
      };
      console.log(updatedOrder, "updated order");
      res.json(updatedOrder);
    }
  } catch (error) {
    console.error(error, "error in order status");
    error.admin = true;
        next(error);
  }
};



const searchOrders = async (req, res) => {
  try {
    const { id, type } = req.query;
    console.log(id, "axios search by status..........", type);

    let ordersList;
    if (id == "All") {
      ordersList = await Order.find({})
        .populate("user", "name")
        .sort({ date: -1 });
    } else if (type == "status") {
      ordersList = await Order.find({ status: id })
        .populate("user", "name")
        .sort({ date: -1 });
    } else if (type == "days") {
      ordersList = await Order.find({})
        .populate("user", "name")
        .sort({ date: -1 })
        .limit(parseInt(id));
    } else if (type == "name") {
      const regex = new RegExp(`^${id}`, "i");
      ordersList = await Order.find({
        "billingAddress.addresses.name": { $regex: regex },
      })
        .populate("user", "name")
        .sort({ date: -1 });
      console.log(ordersList, "by name ");
    }

    const foundOrders = ordersList.reduce((acc, curr) => {
      const datas = {
        _id: curr._id,
        orderID: curr.orderID,
        user: curr.user,
        billingAddress: curr.billingAddress,
        items: curr.items,
        subtotal: curr.subtotal,
        discountAmount: curr.discountAmount,
        total: curr.total,
        paymentMethod: curr.paymentMethod,
        paymentDetails: curr.paymentDetails,
        date: moment(curr.date).format("DD MMM YYYY"),
        status: curr.status,
        couponDetails: curr.couponDetails,
      };

      acc.push(datas);

      return acc;
    }, []);

    console.log(foundOrders, "axios search by status..........");
    res.json(foundOrders);
  } catch (error) {
    console.error(error, "error in the search orders");
    error.admin = true;
        next(error);
  }
};



const salesReport = async (req, res) => {
  
  try {
    let oldDate = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)
  let type = "%d-%m-%Y"
  console.log(oldDate,'old date for the  ')
  const sales = await Order.aggregate([
    { $match: { date: { $gte: oldDate } } },
    {
      $group: {
        _id: { $dateToString: { format: type, date: "$date" } },
        total: { $sum: "$total" },
        count: { $sum: 1 },
        Cod: {
          $sum: {
            $cond: [{ $eq: ["$paymentMethod", "cashondelivery"] }, 1, 0],
          },
        },
        Online: {
          $sum: { $cond: [{ $eq: ["$paymentMethod", "onlinepayment"] }, 1, 0] },
        },
      },
    },
    {
      $sort:{_id:1}
    }
  ])

    const salesReports = sales.reduce((acc, curr) => {
      const datas = {
        id: curr._id,
        total: curr.total,
        profit: ((curr.total * 8) / 100).toFixed(2),
        count: curr.count,
        cod: curr.Cod,
        Online: curr.Online,
      };
      acc.push(datas);
      return acc;
    }, []);


  res.render("admin_sales_report",{salesReports});
  } catch (error) {
    console.error(error,'error admin sales report')
    error.admin = true;
        next(error);
  }

};



const filterReport = async (req, res) => {

  try {
    const { type, from, to } = req.query;

  const startDate = new Date(from);
  const endDate = new Date(to);
  const sales = await Order.aggregate([
    { $match: { date: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $dateToString: { format: type, date: "$date" } },
        total: { $sum: "$total" },
        count: { $sum: 1 },
        Cod: {
          $sum: {
            $cond: [{ $eq: ["$paymentMethod", "cashondelivery"] }, 1, 0],
          },
        },
        Online: {
          $sum: { $cond: [{ $eq: ["$paymentMethod", "onlinepayment"] }, 1, 0] },
        },
      },
    },
    {
      $sort:{_id:1}
    }
  ]);

  console.log(sales, "sales......");

  const salesReports = sales.reduce((acc, curr) => {
    const datas = {
      id: curr._id,
      total: curr.total,
      profit: ((curr.total * 8) / 100).toFixed(2),
      count: curr.count,
      cod: curr.Cod,
      Online: curr.Online,
    };
    acc.push(datas);
    return acc;
  }, []);

  console.log(salesReports, "sales report.........");

  res.json(salesReports);
  } catch (error) {
    console.error(error,'error in sales report')

  }
};



const chartDatas = async (req,res) => {

  try {

    const currentYear = new Date().getFullYear();
    const today = new Date()

    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    console.log(sevenDaysAgo,'sevendays before....')
    const lastWeek = await Order.aggregate([
      {
        $match: {
          date: {
            $gte: sevenDaysAgo
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y,%m,%d", date: "$date" } },
          total: { $sum: "$total" },
          count: { $sum: 1 }
        }
      },
      {
        $sort:{_id:-1}
      }
    ]).limit(7);


    const monthlyReport = await Order.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y,%m", date: "$date" } },
          total: { $sum: "$total" },
          count: { $sum: 1 }
        }
      },
      {
        $sort:{_id:1}
      }
    ]);
    

    const paymentReport = await Order.aggregate([{
      $group: {
        _id: { $dateToString: { format: "%Y", date: "$date" } },
        Cod: {
          $sum: {
            $cond: [{ $eq: ["$paymentMethod", "cashondelivery"] }, 1, 0],
          },
        },
        Online: {
          $sum: { $cond: [{ $eq: ["$paymentMethod", "onlinepayment"] }, 1, 0] },
        },
      },
    }])

    const categoryReport = await Order.aggregate([
       
        {
          $unwind:"$items"
        },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $group: {
            _id:"$productDetails.category",
            total: { $sum: "$productDetails.category" },
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $group: {
            _id:{
              category:"$categoryDetails.name",
              count:"$count"
            }
            
          }
        }
        
      ])

      console.log(categoryReport,'category report.....')
      console.log(categoryReport,'category report.....')

      for(let i = 0 ; i < categoryReport.length; i ++){
        console.log(categoryReport[i]._id.category[0],'category report.....')
      }

    const chartReports = {
      week :lastWeek,
      month:monthlyReport,
      payment:paymentReport,
      category:categoryReport
    }
        
 console.log(chartReports,'category report.....')
    res.json(chartReports)
  } catch (error) {
    console.error(error,'error in chart datas')
    error.admin = true;
        next(error);
  }
}

const banners = async (req,res)=>{
 
  try {
    console.log('banner management............')
    const banner = await Banner.findOne({status:true})
    res.render('adminBanner_management',{banner})
  } catch (error) {
    console.error(error.message,'errror in banner management.....')
    error.admin = true;
        next(error);
  }


}

const editBanner = async (req,res)=>{
 try {
  console.log('banner create............')
  const banner = await Banner.findOne({status:true})
  res.render('admin_edit_banner',{banner})
 } catch (error) {
  console.error(error.message,'error in edit banner .......')
  error.admin = true;
        next(error);
 }
}


const updateBanner = async (req,res)=>{

  try {

    const image = req.files.map((img) => img.filename);
  const { title, Subtitle } = req.body;

  const updatedBanner = await Banner.updateOne({status:true},{
    image:image[0],
    title:title,
    subtitle:Subtitle,
  })

  if(updatedBanner.nModified == 0){
    res.json({message:false})
  }else{
    res.json({message:true})
  }
    
  } catch (error) {
    console.error(error.message,'error in update banner ......')
    error.admin = true;
        next(error);
  }

}

const logout = (req, res) => {
  try {
    req.session.destroy();
  res.redirect("/admin");
  } catch (error) {
    error.admin = true;
        next(error);
  }
};

module.exports = {
  login,
  home,
  logout,
  categories,
  addCategory,
  submitCategory,
  deleteCategory,
  addProduct,
  submitProduct,
  deleteProduct,
  editProduct,
  updateProduct,
  products,
  users,
  userStatus,
  deleteUser,
  createCoupon,
  submitCoupon,
  coupons,
  couponStatus,
  couponDelete,
  orders,
  orderDetails,
  orderStatus,
  searchOrders,
  salesReport,
  filterReport,
  chartDatas,
  banners,
  editBanner,
  updateBanner
};
