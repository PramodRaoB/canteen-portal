const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../utils/keys');

module.exports = (req, res, next) => {
    const authorization = req.headers.authorization
    if (!authorization) {
        return res.json({status: 1, error: "Unauthorized"})
    }
    var token = null;
    if (authorization.startsWith("Bearer"))
        token = authorization.replace("Bearer ", "")
    if (!token) {
        return res.json({status: 1, error: "Invalid token"})
    }
    console.log(token)
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) {
            return res.json({status: 1, error: "Unauthorized"})
        }
        req.user = payload;
        next()
    })
}