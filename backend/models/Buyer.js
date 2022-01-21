const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const BuyerSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    batch: {
        type: String,
        enum: ['UG1', 'UG2', 'UG3', 'UG4', 'UG5'],
        required: true
    }
});

module.exports = Buyer = mongoose.model("Buyer", BuyerSchema);
