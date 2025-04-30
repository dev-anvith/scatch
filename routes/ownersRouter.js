const express = require('express');
const router = express();
const ownerModel = require("../models/owners-model");

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

     let createdOwner = await ownerModel.create({
        fullname,
        email,
        password,

     });
     res.status(201).send(createdOwner);

});


router.get('/admin', (req, res)=>{
   let success = req.flash("success")
   res.render("createproducts", {success});
})

module.exports = router;