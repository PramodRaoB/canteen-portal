const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require("../models/Users")
const Buyer = require("../models/Buyer")
const Vendor = require("../models/Vendor")
const Product = require("../models/Products")

JWT_SECRET = require("../utils/keys")

router.get("/", (req, res) => {
    Product.find((err, products) => {
        if (err) console.log(err);
        else res.json(products);
    })
});

router.post("/add", (req, res) => {
    if (req.user.type !== "vendor") return res.json({status: 1, error: "Unauthorized"})
    let newProduct = new Product({
        name: req.body.name,
        price: req.body.price,
        rating: req.body.rating,
        type: req.body.type,
        addons: req.body.addons,
        tags: req.body.tags
    })
    newProduct.save()
        .then((product) => {
            res.json({
                status: 0,
                message: "Food product added successfully",
                product: product
            })
        })
        .catch((err) => {
            res.json({
                status: 1,
                error: "Error adding product"
            })
        })
})

module.exports = router
