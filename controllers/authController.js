const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const userModel = require('../models/user-model');


module.exports.registerUser = async function (req, res) {
    try {
        let { fullname, email, password } = req.body;

        // Check if user already exists
        let user = await userModel.findOne({email:email});
        if(user) return res.status(402).send("User already exists");

        bcrypt.genSalt(10, (err, salt) => {
            if (err) return res.status(500).send(err.message);

            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) return res.status(500).send(err.message);
                else {
                    let user = await userModel.create({
                        fullname,
                        email,
                        password: hash
                    });
                    let token = jwt.sign({ email, id: user._id }, process.env.JWT_KEY);


                    res.cookie("token", token);

                    res.send("user created successfully");

                }

            });
        });
    } catch (err) {
        res.send(err.message);

    }
}

module.exports.loginUser = async function(req, res){
    try{
        let {email, password} = req.body;
        let user = await userModel.findOne({email:email});
        if(!user){
            return res.send("Email or Password incorrect");
        }
        bcrypt.compare(password, user.password, function(err, result){
            if(result){
                let token = jwt.sign({ email, id: user._id }, process.env.JWT_KEY);
                res.cookie("token", token);
                res.redirect('/shop');
            }else{
                return res.send("Email or Password incorrect");
            }
        })

    }catch(err){
        res.send(err.message);
    }

};

module.exports.logout = function(req, res){
    res.clearCookie("token");
    res.redirect('/');
};