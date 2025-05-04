const mongoose = require('mongoose');
require("dotenv").config();
// Ensuring the environment variable exists
if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not defined in your environment.");
    process.exit(1); // Exit if the connection URI is not found
}

mongoose
    .connect(`${process.env.MONGODB_URI}/scatch`, { useNewUrlParser: true, useUnifiedTopology: true }) // Added options for compatibility
    .then(() => {
        console.log("Connected to MongoDB successfully!");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit process if connection fails
    });

module.exports = mongoose.connection;
