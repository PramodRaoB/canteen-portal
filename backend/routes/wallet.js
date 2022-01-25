const express = require("express");
const router = express.Router();

const Buyer = require("../models/Buyer")

router.get("/", async (req, res) => {
    if (!req.user || req.user.type !== "buyer") return res.json({status: 1, error: "Unauthorized"})
    const user = await Buyer.findOne({email: req.user.email});
    if (!user) return res.json({status: 1, error: "Error getting wallet"})
    return res.json({status: 0, message: user.wallet});
})

router.post("/update", async (req, res) => {
    if (!req.user || req.user.type !== "buyer") return res.json({status: 1, error: "Unauthorized"});
    console.log(req.body);
    var updateUser;
    const user = await Buyer.findOne({email: req.user.email});
    if (!user) return res.json({status: 1, error: "Error getting wallet"})
    try {
        updateUser = {
            wallet: user.wallet + parseInt(req.body.amount)
        }
    }
    catch {
        return res.json({status: 1, error: "Error updating wallet"})
    }
    Buyer.updateOne({email: req.user.email}, updateUser, (err, doc) => {
        if (err) return res.json({status: 1, error: err})
        return res.json({status: 0, message: "Successfully updated wallet"})
    })
})

module.exports = router;
