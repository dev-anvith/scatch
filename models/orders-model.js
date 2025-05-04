const mongoose = require("mongoose");

const ordersSchema = mongoose.Schema({
  products:[
    {
        name: String, 
        quantity: Number,
        product:{
              type: mongoose.Schema.Types.ObjectId,
              ref: "products"
            }
    }
  ],
  orderDate:{
    type: Date,
    default: Date.now
  },
  status: String,
  totalAmount: Number,
  orderId: String
});

module.exports = mongoose.model("orders", ordersSchema);
