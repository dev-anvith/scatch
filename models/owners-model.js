const mongoose = require('mongoose');


const ownerSchema = mongoose.Schema({
    fullname: {
        type: String,
        minLenght: 3,
        trim: true
    },
    email: String,
    password: String,
    products: {
        type: Array,
        default: []
    },

    gstin: Number,
    picture: String
});

module.exports = mongoose.model("owner", ownerSchema);