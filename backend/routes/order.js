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

router.get("/", async (req, res) => {
    if (!req.user) return res.json({status: 1, error: "Unauthorized"})
    var user = await User.findOne({email: req.user.email}).populate('orders');
    if (!user) return res.json({status: 1, error: "User not found"})
    // user.populate('orders')
    return res.json({status: 0, message: user.orders})
})

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
            price: product.price,
            pid: product._id
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

router.post("/pickup", async (req, res) => {
    if (!req.user || req.user.type !== "buyer") return res.json({status: 1, error: "Unauthorized"})
    var id = req.body.pid
    var order = await Order.findById(id)
    if (!order) return res.json({status: 1, error: "Order does not exist"})
    var buyer = await User.findOne({email: req.user.email}).populate('orders')
    if (!buyer) return res.json({status: 1, error: "User does not exist"})
    if (buyer.orders.findIndex((p) => (p._id == id)) === -1) return res.json({status: 1, error: "Order does not exist"})

    if (order.status !== 'READY FOR PICKUP') return res.json({status: 1, error: "Order not ready to be picked up"})

    order.status = "COMPLETED"
    order.save((err) => {
        if (err) return res.json({status: 1, error: err})
        return res.json({status: 0, message: "Order successfully picked up!"})
    })
})

router.post("/progress", async (req, res) => {
    if (!req.user || req.user.type !== "vendor") return res.json({status: 1, error: "Unauthorized"})
    var id = req.body.pid;
    var order = await Order.findById(id)
    if (!order) return res.json({status: 1, error: "Order does not exist"})
    var vendor = await User.findOne({email: req.user.email}).populate('orders')
    if (!vendor) return res.json({status: 1, error: "User does not exist"})
    if (vendor.orders.findIndex((p) => (p._id == id)) === -1) return res.json({status: 1, error: "Order does not exist"})
    var newStatus

    if (order.status === 'ACCEPTED') newStatus = 'COOKING'
    else if (order.status === 'COOKING') newStatus = 'READY FOR PICKUP'
    else return res.json({status: 1, error: "Not applicable"})

    order.status = newStatus

    order.save((err) => {
        if (err) return res.json({status: 1, error: err})
        return res.json({status: 0, message: "Successfully moved"})
    })
})


router.post("/accept", async (req, res) => {
    if (!req.user || req.user.type !== "vendor") return res.json({status: 1, error: "Unauthorized"})
    var id = req.body.pid;
    var order = await Order.findById(id)
    if (!order) return res.json({status: 1, error: "Order does not exist"})
    var vendor = await User.findOne({email: req.user.email}).populate('orders')
    if (!vendor) return res.json({status: 1, error: "User does not exist"})
    console.log(vendor.orders)
    if (vendor.orders.findIndex((p) => (p._id == id)) === -1) return res.json({status: 1, error: "Order does not exist"})

    if (order.status !== 'PLACED') {
        if (order.status === 'REJECTED') return res.json({status: 1, error: "Order already rejected"})
        else return res.json({status: 1, error: "Order already accepted"})
    }

    var cnt = 0
    for (let i in vendor.orders) {
        var x = vendor.orders[i]
        if (x.status === 'ACCEPTED' || x.status === 'COOKING')
            cnt++;
    }
    if (cnt >= 10) {
        return res.json({status: 1, error: "Cannot accept any more orders!"})
    }

    order.status = 'ACCEPTED'

    order.save((err) => {
        if (err) return res.json({status: 1, error: err})
        return res.json({status: 0, message: "Successfully accepted"})
    })
})

router.post("/reject", async (req, res) => {
    if (!req.user || req.user.type !== "vendor") return res.json({status: 1, error: "Unauthorized"})
    var id = req.body.pid;
    var order = await Order.findById(id)
    if (!order) return res.json({status: 1, error: "Order does not exist"})
    var vendor = await User.findOne({email: req.user.email}).populate('orders')
    if (!vendor) return res.json({status: 1, error: "User does not exist"})
    if (vendor.orders.findIndex((p) => (p._id == id)) === -1) return res.json({status: 1, error: "Order does not exist"})

    if (order.status !== 'PLACED') return res.json({status: 1, error: "Order already accepted"})

    order.status = 'REJECTED'

    order.save((err) => {
        if (err) return res.json({status: 1, error: err})
        return res.json({status: 0, message: "Successfully rejected"})
    })
})

router.post("/rate", async (req, res) => {
    if (!req.user || req.user.type !== "buyer") return res.json({status: 1, error: "Unauthorized"})
    var id = req.body.pid;
    var newRating = parseInt(req.body.rating)
    var order = await Order.findById(id)
    if (!order) return res.json({status: 1, error: "Order does not exist"})
    var buyer = await User.findOne({email: req.user.email}).populate('orders')
    if (!buyer) return res.json({status: 1, error: "User does not exist"})
    if (buyer.orders.findIndex((p) => (p._id == id)) === -1) return res.json({status: 1, error: "Order does not exist"})

    var product = await Product.findById(order.item.pid)
    if (product) {
        if (!order.rating) {
            product.rating.count++
            product.rating.total += newRating
        }
        else {
            product.rating.total += newRating - parseInt(order.rating)
        }
        product.save(err => {
            if (err) return res.json({status: 1, error: err.toString()})
        })
    }
    order.rating = newRating
    order.save((err) => {
        if (err) return res.json({status: 1, error: err.toString()})
        return res.json({status: 0, message: "Thank you for your feedback!"})
    })
})

router.get("/stats", async (req, res) => {
    if (!req.user || req.user.type !== "vendor") return res.json({status: 1, error: "Unauthorized"})
    const vendor = await Vendor.findOne({email: req.user.email}).populate('products')
    if (!vendor) return res.json({status: 1, error: "User not found"})
    const user = await User.findOne({email: req.user.email}).populate('orders')
    if (!user) return res.json({status: 1, error: "User not found"})

    let pCnt = []
    for (const i in vendor.products) {
        let product = vendor.products[i]
        let temp = 0
        for (const j in user.orders) {
            let order = user.orders[j]
            if (order.item.pid == product._id)
                temp++
        }
        pCnt.push({name: product.name, count: temp})
    }
    pCnt.sort((a, b) => b.count - a.count)
    let completed = 0, placed = 0, pending = 0
    for (const i in user.orders) {
        let order = user.orders[i]
        if (order.status === 'COMPLETED') completed++
        if (order.status === 'PLACED' || order.status === 'ACCEPTED' || order.status === 'COOKING') pending++
        placed++
    }
    var retArr = pCnt.slice(0, 5)
    while (retArr.length < 5) retArr.push({name: "Your next big success!", count: ":D"})
    return res.json({status: 0, message: {topOrders: retArr, placed: placed, completed: completed, pending: pending}})
})

router.get("/agestats", async (req, res) => {
    if (!req.user || req.user.type !== "vendor") return res.json({status: 1, error: "Unauthorized"})
    const vendor = await Vendor.findOne({email: req.user.email}).populate('products')
    if (!vendor) return res.json({status: 1, error: "User not found"})
    const user = await User.findOne({email: req.user.email}).populate('orders')
    if (!user) return res.json({status: 1, error: "User not found"})

    var ages = {}
    const allBuyers = await Buyer.find({})
    for (const i in allBuyers) {
        let buyer = allBuyers[i]
        const user_ = await User.findOne({email: buyer.email}).populate('orders')
        if (!ages[buyer.age])
            ages[buyer.age] = 0
        for (const j in user_.orders) {
            if (user_.orders[j].vendor === vendor.shop && user_.orders[j].status === 'COMPLETED')
                ages[buyer.age]++
        }
    }

    var labels = [], data = []

    for (const [key, value] of Object.entries(ages)) {
        labels.push(key)
        data.push(value)
    }
    return res.json({status: 0, message: {labels: labels, data: data}})
})

router.get("/batchstats", async (req, res) => {
    if (!req.user || req.user.type !== "vendor") return res.json({status: 1, error: "Unauthorized"})
    const vendor = await Vendor.findOne({email: req.user.email}).populate('products')
    if (!vendor) return res.json({status: 1, error: "User not found"})
    const user = await User.findOne({email: req.user.email}).populate('orders')
    if (!user) return res.json({status: 1, error: "User not found"})

    var batches = ['UG1', 'UG2', 'UG3', 'UG4', 'UG5']
    var test = {}
    var users = await Buyer.find({})
    for (const i in users) {
        var user_ = await User.findOne({email: users[i].email}).populate('orders')
        if (!test[users[i].batch])
            test[users[i].batch] = 0
        for (const j in user_.orders) {
            if (user_.orders[j].vendor === vendor.shop && user_.orders[j].status === 'COMPLETED')
                test[users[i].batch]++
        }
    }
    var retArr = []
    for (const i in batches) {
        if (!test[batches[i]]) test[batches[i]] = 0
        retArr.push(test[batches[i]])
    }
    return res.json({status: 0, message: retArr})
})

module.exports = router