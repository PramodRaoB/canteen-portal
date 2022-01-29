const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const OrderSchema = new Schema({
    buyer: {
        type: String,
        required: true
    },
    placedTime: {
        type: Date,
        default: Date.now()
    },
    vendor: {
        type: String,
        required: true
    },
    item: {
        name: {type: String, required: true},
        price: {type: Number, required: true},
        // pid: {type: Schema.Types.ObjectId, ref: "Product", required: true}
        pid: {type: String, required: true}
    },
    status: {
        type: String,
        enum: ["PLACED", "ACCEPTED", "COOKING", "READY FOR PICKUP", "COMPLETED", "REJECTED"],
        default: "PLACED"
    },
    rating: {
        type: Number,
        min: 0,
        max: 5
    },
    quantity: {
        type: Number,
        min: 1,
    },
    total: {
        type: Number,
        required: true
    }
});

module.exports = Order = mongoose.model("Order", OrderSchema);
