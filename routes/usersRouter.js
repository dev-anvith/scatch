const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 
const isLoggedIn = require("../middlewares/isLoggedIn");
const userModel = require('../models/user-model');
const ownersModel = require('../models/owners-model');
const orderModel = require('../models/orders-model');
const upload = require('../config/multer-config');
const productModel = require('../models/product-model');

router.get('/', function(req, res){
    res.send("HEY OW");
});

router.post('/register',  authController.registerUser);

router.post("/login", authController.loginUser);

router.get('/logout',isLoggedIn,  authController.logout);

router.get('/dash', (req, res)=>{
    res.render('userDash')
})

router.post('/checkout', isLoggedIn, async (req, res)=>{
    let userid = req.user._id
    const user = await userModel.findById(userid).populate("cart.product");
    const products = user.cart.map((item)=>({
        name : item.product.name,
        quantity : item.quantity,
        product : item.product._id
    }))
    const totalAmount = user.cart.reduce((total, item)=>{
        return total + item.quantity*item.product.price;
    },0);

    const order = await orderModel.create({
        products,
        status:"Pending",
        totalAmount,
        orderId: 'ORD'+Date.now()
    });
    user.orders.push( order._id ); 
     
    user.cart = [];
    await user.save();
    req.flash("success", "Order Placed Successfully")
    res.redirect('/users/account');
})

router.get('/account', isLoggedIn, async (req, res)=>{
    const user = await userModel.findById(req.user._id).populate("orders");
    const success = req.flash("success");
    res.render('userDash', {user, success});


})

router.get('/settings',isLoggedIn, (req, res)=>{
    res.render('settings', );
})

router.post('/settings',  upload.single('image'), isLoggedIn, async (req, res)=>{
    try{
        const user = await userModel.findById(req.user._id);
    user.picture = req.file.buffer;
    user.contact = req.body.contact;
    user.email = req.body.email;;
    user.save();
    req.flash("success", "Updated successfully");
    res.redirect('/users/account')

    }catch(err){
        req.flash("success", " Failed to Update");
        res.redirect('/users/account');
    }

})

router.get('/sort/popular',async (req, res)=>{
    const result = await orderModel.aggregate([
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.product", // group by product ObjectId
            totalSold: { $sum: "$products.quantity" }
          }
        },
        {
          $lookup: {
            from: "products",         // collection name (not model name)
            localField: "_id",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        { $unwind: "$productDetails" },
        { $sort: { totalSold: -1 } } // 🔥 sort by popularity descending
      ]);
      
      const orderedProductIds = result.map(item => item._id);
      const unorderedProducts = await productModel.find({
        _id: { $nin: orderedProductIds }
      });
      const products = [
        ...result.map(item => ({
          ...item.productDetails,
          totalSold: item.totalSold
        })),
        ...unorderedProducts.map(prod => ({
          ...prod.toObject(),
          totalSold: 0
        }))
      ];
      let success = req.flash("success", "")
      res.render('shop', {products, success, isPopular:true});
      
});


router.get('/sort/newest', async (req, res)=>{
    const products = await productModel.find().sort({_id:-1});
    let success = req.flash("success", "");
    res.render('shop', {products, success});
})

module.exports = router;