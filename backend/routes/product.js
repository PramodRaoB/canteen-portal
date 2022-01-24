const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require("../models/Users")
const Buyer = require("../models/Buyer")
const Vendor = require("../models/Vendor")
const Product = require("../models/Products")

JWT_SECRET = require("../utils/keys")

// GET request
// Getting all the users
router.get("/", (req, res) => {
    Product.find((err, products) => {
        if (err) console.log(err);
        else res.json(products);
    })
});

module.exports = router
