const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require("../models/Users")
const Buyer = require("../models/Buyer")
const Vendor = require("../models/Vendor")
const Product = require("../models/Products")
const Order = require("../models/Orders")
const {DateTime} = require("luxon");

JWT_SECRET = require("../utils/keys")

router.post("/new", async (req, res) => {
    if (!req.user || req.user.type !== "buyer") return res.json({status: 1, error: "Unauthorized"})
    var product = await Product.findById(req.body.pid)
    if (!product) return res.json({status: 1, error: "Product does not exist"})
    var buyer = await Buyer.findOne({email: req.user.email})
    if (!buyer) return res.json({status: 1, error: "User does not exist!"})
    var userB = await User.findOne({email: req.user.email})
    if (!userB) return res.json({status: 1, error: "User does not exist"})
    var vendor = await Vendor.findById(product.shop)
    if (!vendor) return res.json({status: 1, error: "Vendor does not exist"})
    var userV = await User.findOne({email: vendor.email})
    if (!userV) return res.json({status: 1, error: "Vendor does not exist"})
    var quantity = parseInt(req.body.quantity)
    if (!quantity || quantity <= 0) return res.json({status: 1, error: "Invalid quantity"})
    //compute total
    //TODO: Addons
    var total = product.price * quantity;
    if (!total || total < 0) return res.json()

    if (buyer.wallet < total) return res.json({status: 1, error: "Not enough funds in wallet"})
    buyer.wallet -= total

    var now = DateTime.now()
    var open = DateTime.fromISO(vendor.opening)
    var close = DateTime.fromISO(vendor.closing)
    if (open < close && !(open <= now && now < close)) return res.json({status: 1, error: "Vendor is closed"})
    if (close < open && (close <= now && now < open)) return res.json({status: 1, error: "Vendor is closed"})


    var order = new Order({
        buyer: userB.name,
        vendor: vendor.shop,
        item: {
            name: product.name,
            price: product.price
        },
        quantity: quantity,
        total: total
    })

    order.save()
        .then((value) => {
            userB.orders.push(value._id)
            userV.orders.push(value._id)
            userB.save()
            userV.save()
            buyer.save()
            return res.json({status: 0, message: "Order successfully placed!"})
        })
        .catch(err => {
            return res.json({status: 1, error: err})
        })
})

module.exports = router