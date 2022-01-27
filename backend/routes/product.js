const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require("../models/Users")
const Buyer = require("../models/Buyer")
const Vendor = require("../models/Vendor")
const Product = require("../models/Products")
const {DateTime} = require("luxon");

JWT_SECRET = require("../utils/keys")

router.get("/", async (req, res) => {
    if (!req.user || req.user.type !== "buyer") return res.json({status: 1, error: "Unauthorized"})
    const buyer = await Buyer.findOne({email: req.user.email})
    if (!buyer) return res.json({status: 1, error: "User does not exist"})

    const checkOpen = (v) => {
        const now = DateTime.now();
        const open = DateTime.fromISO(v.opening)
        const close = DateTime.fromISO(v.closing)
        return ((open < close && open <= now && now < close) || (close < open && !(close <= now && now < open)))
    }

    const getVendor = (p) => {
        const id = p.shop;
        return Vendor.findById(id);
    }

    var isOpen = {}

    var products = await Product.find().populate('shop');
    var ret = {
        available: [],
        unavailable: [],
        afavourites: [],
        ufavourites: []
    }

    for (let i in products) {
        let p = products[i]
        const vendor = await getVendor(p);
        if (!vendor) continue;
        if (!(vendor.shop in isOpen)) isOpen[vendor.shop] = checkOpen(vendor)
        if (isOpen[vendor.shop]) {
            ret.available.push(p);
            if (buyer.favourites.includes(p._id)) ret.afavourites.push(p);
        }
        else {
            ret.unavailable.push(p);
            if (buyer.favourites.includes(p._id)) ret.ufavourites.push(p);
        }
    }
    return res.json({status: 0, message: ret})
});

router.post("/add", async (req, res) => {
    if (req.user.type !== "vendor") return res.json({status: 1, error: "Unauthorized"})
    var vendor = await Vendor.findOne({email: req.user.email});
    if (!vendor) return res.json({status: 1, error: "User doesn't exist"})
    let newProduct = new Product({
        name: req.body.name,
        price: req.body.price,
        rating: req.body.rating,
        shop: vendor._id,
        type: req.body.type,
        addons: req.body.addons,
        tags: req.body.tags
    })
    newProduct.save()
        .then((product) => {
            vendor.products.push(product._id);
            vendor.save();
            res.json({
                status: 0,
                message: "Food product added successfully",
                product: product
            })
        })
        .catch((err) => {
            console.log(err)
            res.json({
                status: 1,
                error: "Error adding product"
            })
        })
})

router.get("/favourite", async (req, res) => {
    if (!req.user || req.user.type !== "buyer") return res.json({status: 1, error: "Unauthorized"})
    var buyer = await Buyer.findOne({email: req.user.email})
    if (!buyer) return res.json({status: 1, error: "User not found!"})
    return res.json({status: 0, message: buyer.favourites})
})

router.post("/favourite", async (req, res) => {
    if (!req.user || req.user.type !== "buyer") return res.json({status: 1, error: "Unauthorized"})
    var buyer = await Buyer.findOne({email: req.user.email})
    if (!buyer) return res.json({status: 1, error: "User not found"})
    var product = await Product.findById(req.body.pid)
    if (!product) return res.json({status: 1, error: "Product not found!"})
    var id = req.body.pid
    const ind = buyer.favourites.findIndex((i) => (i == id))
    if (ind !== -1) buyer.favourites.splice(ind, 1)
    else buyer.favourites.push(id)

    buyer.save((err) => {
        if (err) return res.json({status: 1, error: err})
        return res.json({status: 0, message: "Favourite updated!"})
    })
})

module.exports = router
