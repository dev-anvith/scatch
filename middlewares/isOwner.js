const jwt = require("jsonwebtoken");


module.exports = function(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        req.flash("error", "You don't have the access");
        return res.redirect("/");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        
        if (!decoded.isAdmin) {
            return res.status(403).send("Access Denied");
        }

        
        req.owner = decoded;
        next();

    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
};
