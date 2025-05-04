const express = require('express');
const router = express();
const ownerModel = require("../models/owners-model");
const { route } = require('.');
const bcrypt = require('bcrypt');
const isOwnerLoggedIn = require('../middlewares/isOwner');
const auth = require('../controllers/authController');
const productModel = require('../models/product-model');
const ordersModel = require("../models/orders-model");

router.get('/', function(req, res){
    res.send("HEY OWNER");
});


router.post('/register',async (req, res)=>{
     let owners =await ownerModel.find({email:req.body.email});
     if(owners.length>0){
        return res
        .status(500)
        .send("User already exists");
     }
     let {fullname, email, password} = req.body;

     bcrypt.genSalt(10, (err, salt)=>{
      bcrypt.hash(password, salt, async (err, hash)=>{
         let createdOwner = await ownerModel.create({
            fullname,
            email,
            password:hash,
          
         });
         res.status(201).send(createdOwner);
      })
     })

     
     

});

router.get('/login', (req, res)=>{
   res.render("owner-login", {loggedin:false});
})

router.get('/admin',isOwnerLoggedIn,async function(req, res){
   let products = await productModel.find();   
   res.render("admin",{loggedin:false, products});
});

router.post('/login', auth.loginOwner);


router.get('/create',isOwnerLoggedIn, (req, res)=>{
   let success = req.flash("success")
   res.render("createproducts", {success, loggedin:false});
})

router.post('/delete/:id', isOwnerLoggedIn, async (req, res)=>{
   try {
      const productId = req.params.id;
      const deletedProduct = await productModel.findOneAndDelete({ _id: productId });
  
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.redirect('/owners/admin')
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
})

router.post('/deleteall',isOwnerLoggedIn, async (req, res) => {
   try {
     await productModel.deleteMany({});
     res.redirect('/owners/admin');
   } catch (err) {
     res.sendStatus(500);
   }
 });
 
router.get('/orders', isOwnerLoggedIn,async (req, res)=>{
   let orders = await ordersModel.find({ status: { $ne: "Delivered" } });

   res.render('currentOrders',{orders});
})

router.post('/shipped/:id', isOwnerLoggedIn, async (req, res)=>{
   const order = await ordersModel.findById(req.params.id);
   order.status="Shipped";
   await order.save();
   res.redirect('/owners/orders');
})

router.post('/delivered/:id', isOwnerLoggedIn, async (req, res)=>{
   const order = await ordersModel.findById(req.params.id);
   order.status="Delivered";
   await order.save();
   res.redirect('/owners/orders');
})


router.get('/logout', isOwnerLoggedIn, auth.logout);

module.exports = router;