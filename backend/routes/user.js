const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require("../models/Users")
const Buyer = require("../models/Buyer")
const Vendor = require("../models/Vendor")

JWT_SECRET = require("../utils/keys")

router.get("/ret", (req, res) => {
    if (!req.user) {
        return res.json({status: 1, error: "Error obtaining user"})
    }
    console.log(req.user)
    res.send(req.user)
})

router.get("/profile", async function(req, res) {
    if (!req.user) return res.json({status: 1, error: "Unauthorized"})
    const retUser = await User.findOne({email: req.user.email});
    if (!retUser) return res.json({status: 1, error: "Couldn't find user"})
    let retProfile;
    if (req.user.type === "buyer") {
        retProfile = await Buyer.findOne({email: req.user.email});
        if (!retProfile) return res.json({status: 1, error: "Couldn't find buyer"})
    }
    else {
        retProfile = await Vendor.findOne({email: req.user.email});
        if (!retProfile) return res.json({status: 1, error: "Couldn't find vendor"})
    }
    let returnObj;
    returnObj = {
        name: retUser.name,
        email: retUser.email,
        contact: retUser.contact,
    }
    if (retUser.type === "buyer") {
        returnObj.age = retProfile.age;
        returnObj.batch = retProfile.batch;
        returnObj.type = "buyer";
    }
    else {
        returnObj.shop = retProfile.shop;
        returnObj.opening = retProfile.opening;
        returnObj.closing = retProfile.closing;
        returnObj.type = "vendor";
    }
    res.send(returnObj)
});

router.post("/profile/update", async (req, res) => {
    const newUser = {
        name: req.body.name,
        contact: req.body.contact
    }
    const currUser = await User.findOne({email: req.user.email});
    User.updateOne({email: req.user.email}, newUser, (err, doc) => {
        if (err) {
            return res.json({status: 1, error: err})
        }
    })
    if (req.user.type === "buyer") {
        let newProfile = {
            age: req.body.age,
            batch: req.body.batch
        }
        Buyer.updateOne({email: req.user.email}, newProfile, (err, doc) => {
            if (err) {
                console.log(err);
                User.updateOne({email: req.user.email}, currUser);
                return res.json({status: 1, error: err})
            }
        })
    }
    else {
        let newProfile = {
            shop: req.body.shop,
            opening: req.body.opening,
            closing: req.body.closing
        }
        Vendor.updateOne({email: req.user.email}, newProfile, (err, doc) => {
            if (err) {
                console.log(err);
                User.updateOne({email: req.user.email}, currUser);
                return res.json({status: 1, error: err})
            }
        })
    }
    return res.json({status: 0, message: "Successfully updated profile!"})


})

module.exports = router;
