const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require("../models/Users")
const Buyer = require("../models/Buyer")
const Vendor = require("../models/Vendor")

JWT_SECRET = require("../utils/keys")

// GET request 
// Getting all the users
router.get("/", function(req, res) {
    User.find(function(err, users) {
		if (err) {
			console.log(err);
		} else {
			res.json(users);
		}
	})
});

// NOTE: Below functions are just sample to show you API endpoints working, for the assignment you may need to edit them

// POST request 
// Add a user to db
router.post("/register", async (req, res) => {
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        contact: req.body.contact,
        type: req.body.type
    });
    let typeUser;
    if (newUser.type === "buyer") {
        typeUser = new Buyer({
            email: req.body.email,
            age: req.body.age,
            batch: req.body.batch
        });
    }
    else {
        typeUser = new Vendor({
            email: req.body.email,
            shop: req.body.shop,
            opening: req.body.opening,
            closing: req.body.closing
        });
    }
    bcrypt.hash(newUser.password,12)
        .then((retHash)=>{
            User.findOne({email:newUser.email})
                .then(async (savedUser)=>{
                    if(savedUser){
                        return res.status(422).json({
                            status: 1,
                            error:"User already exists with that email"
                        })
                    }
                    newUser.password = retHash;
                    newUser.save()
                        .then((user)=>{
                            console.log(user.email)
                            console.log(user.password)
                            typeUser.save()
                                .then((user)=>{
                                    res.json({
                                        status: 0,
                                        message:"Type Saved Successfully"
                                    })
                                    console.log(user.email)
                                })
                                .catch(async (err)=>{
                                    console.log(err)
                                    res.json({
                                        status: 1,
                                        error: "Error registering user"
                                    })
                                    User.deleteOne({email: newUser.email})
                                        .then(() => {
                                            console.log("Deleted successfully")
                                        })
                                        .catch(() => {
                                            console.log("Error while deleting")
                                        })
                                })
                        })
                        .catch(async (err)=>{
                            console.log(err)
                            res.json({
                                status: 1,
                                error: "Error registering user"
                            })
                            await newUser.remove()
                        })

                })
                .catch(async (err)=>{
                    console.log(err)
                    res.json({
                        status: 1,
                        error: "Error registering user"
                    })
                })

        })
        .catch(async (err)=>{
            console.log(err)
            res.json({
                status: 1,
                error: "Error creating hash"
            })
        })
});

// POST request 
// Login
router.post("/login", (req, res) => {
    let newUser = new User({
        email: req.body.email,
        password: req.body.password,
    });
    User.findOne({email: newUser.email})
        .then((retUser)=>{
            if(!retUser){
                return res.json({status: 1, error:"User with email does not exist!"})
            }
            bcrypt.compare(newUser.password, retUser.password)
                .then(match =>{
                    if (match) {
                        const token = jwt.sign({
                            email: newUser.email,
                            type: newUser.type
                        }, JWT_SECRET);
                        return res.json({status: 0, token: token})
                    }
                    return res.json({status: 1, error:"Invalid password"})

                })
                .catch((err)=>{
                    console.log(err)
                    return res.json({status: 1, error: err})
                })
    })
});

module.exports = router;

