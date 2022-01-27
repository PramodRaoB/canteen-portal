const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ProductSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    rating: {
        count: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        }
    },
    shop: {
        type: Schema.Types.ObjectId,
        ref: "Vendor",
        required: true
    },
    type: {
        type: String,
        enum: ['Veg', 'Non-Veg'],
        required: true
    },
    addons: [{
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    tags: {
        type: [String],
    }
});

module.exports = Product = mongoose.model("Product", ProductSchema);
