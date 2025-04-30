const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 
const isLoggedIn = require("../middlewares/isLoggedIn");


router.get('/', function(req, res){
    res.send("HEY OW");
});

router.post('/register',  authController.registerUser)

router.post("/login", authController.loginUser);

router.get('/logout',isLoggedIn,  authController.logout);

module.exports = router;