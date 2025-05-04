const express = require('express');
const router = express.Router();
const productModel = require('../models/product-model');
const userModel = require('../models/user-model');
const isLoggedIn = require('../middlewares/isLoggedIn');
const mongoose = require('mongoose');

router.get('/', (req, res) => {
    let error = req.flash("error");
    res.render("index", { error, loggedin: false });
});

router.get('/shop', isLoggedIn, async (req, res) => {
    let randomOrder = Math.random();
    let products = await productModel.find().sort({ name:1});

    let success = req.flash("success");

    res.render("shop", { products, success });


})


router.post('/addtocart/:id', isLoggedIn, async (req, res) => {
    try {
        const productId = req.params.id;

        // Check if it's a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {

            return res.redirect('/shop');
        }

        let user = await userModel.findOne({ email: req.user.email });
        const existingItem = await user.cart.find(item => item.product.equals(productId));

        const product = await productModel.findById(productId);
        // Prevent duplicate entries in cart (optional)
        if (!existingItem) {
            user.cart.push({
                product: productId,
                quantity: 1
            });
            product.stock-=1;
            await product.save();
            req.flash("success", "Added to cart");
            await user.save();

        } else {
            req.flash("success", "Item already in Cart");
        }

        res.redirect('/shop');
    } catch (err) {
        console.error("Error adding to cart:", err);

        res.redirect('/shop');
    }
});

router.get('/cart', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email }).populate("cart.product");
    let bill = 0, discount = 0;
    user.cart.forEach((item) => {
        bill += item.product.price *item.quantity;
        discount += item.product.discount*item.quantity;
    })
    let success = req.flash("message");
    res.render("cart", { user, bill, discount, success });
});


router.post('/cart/update/:id', isLoggedIn, async (req, res) => {
    const user = await userModel.findOne({ email: req.user.email });
    const productId = req.params.id;
    const action = req.body.action;
    const product = await productModel.findById(productId);
    const item = await user.cart.find(item => item.product.equals(productId));

    if (item) {
        if (action === 'increase') {
            if(product.stock>0){
                item.quantity += 1;
                product.stock-=1;

            }
            else{
                req.flash("message", "Failed to add, product out of stock")
            }
            
        }
        else if (action === 'decrease') {
            if (item.quantity > 1) {
                item.quantity -= 1;
                product.stock+=1
            }
            if (item.quantity === 1) {
                user.cart.pull({ product: productId });
                product.stock+=1;
            }
        }
    }
    await product.save();
    await user.save();    
    res.redirect('/cart');
});

router.get('/discounted',isLoggedIn, async (req, res)=>{
    let products = await productModel.find({discount:{$gt:0}}).sort({discount:-1});

    let success = req.flash("success");

    res.render("shop", { products, success });
})

module.exports = router;