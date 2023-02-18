const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const { adminSession, adminSessionAxios } = require("../middlewares/adminsession");

const {
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
} = require("../controllers/admin");

/* GET admin listing. */

// const check = (req,res)=>{
//   console.log(req.query.id,'axios calling to delete cat ')
//   res.send({value:true})
// }

router.get("/", login);
router.post("/home", home);
router.get("/logout", logout);
router.get("/categories", adminSession, categories);
router.get("/category", adminSession, addCategory);
router.post("/category", adminSessionAxios, submitCategory);
router.delete("/category", adminSessionAxios, deleteCategory);
router.get("/product", adminSession, addProduct);
router.post("/product", adminSession,upload.array("productimage", 5),submitProduct);
router.delete("/product", adminSessionAxios, deleteProduct);
router.get("/product/:id", adminSession, editProduct);
router.patch("/product", adminSessionAxios,upload.array("productimage", 5), updateProduct);
router.get("/products/:id", adminSession, products);
router.get("/users", adminSession, users);
router.patch("/user/:id", adminSessionAxios, userStatus);
router.delete("/user/:id", adminSessionAxios, deleteUser);
router.get("/coupon", adminSession, createCoupon);
router.post("/coupon", adminSession, submitCoupon);
router.get("/coupons", adminSession, coupons);
router.patch("/coupon/:id", adminSessionAxios, couponStatus);
router.delete("/coupon/:id", adminSessionAxios, couponDelete);
router.get("/orders", adminSession, orders );
router.get("/order", adminSession, orderDetails );
router.patch("/order", adminSessionAxios,orderStatus );
router.get("/search-orders", adminSessionAxios,searchOrders );
router.get("/sales-reports",adminSession,salesReport );
router.get("/sales-report",adminSessionAxios,filterReport );
router.get("/chart-datas",adminSessionAxios,chartDatas );
router.get("/banners",adminSession,banners );
router.get("/banner",adminSession,editBanner );
router.post("/banner",adminSessionAxios,upload.array("banner",2),updateBanner );


module.exports = router;
