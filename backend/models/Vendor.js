const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const VendorSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    shop: {
        type: String,
        required: true,
        unique: true
    },
    opening: {
        type: String,
        required: true
    },
    closing: {
        type: String,
        required: true
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: "Product"
    }]
});

module.exports = Vendor = mongoose.model("Vendor", VendorSchema);
