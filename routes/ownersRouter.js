const express = require('express');
const router = express();
const ownerModel = require("../models/owners-model");
const { route } = require('.');
const bcrypt = require('bcrypt');
const isOwnerLoggedIn = require('../middlewares/isOwner');
const auth = require('../controllers/authController')

router.get('/', function(req, res){
    res.send("HEY OWNER");
});


router.post('/create',async (req, res)=>{
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
   res.render("owner-login");
})

router.get('/admin',isOwnerLoggedIn, function(req, res){
   res.render("admin")
});

router.post('/login', auth.loginOwner);


router.get('/create',isOwnerLoggedIn, (req, res)=>{
   let success = req.flash("success")
   res.render("createproducts", {success});
})

router.get('/logout', isOwnerLoggedIn, auth.logout);

module.exports = router;