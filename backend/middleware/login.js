const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../utils/keys');

module.exports = (req, res, next) => {
    console.log(req.headers)
    const authorization = req.headers.authorization
    console.log(authorization)
    if (!authorization) {
        return res.status(401).json({error: "Unauthorized"})
    }
    var token = null;
    if (authorization.startsWith("Bearer"))
        token = authorization.replace("Bearer ", "")
    if (!token) {
        return res.status(401).json({error: "Invalid token"})
    }
    console.log(token)
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(401).json({error: "Unauthorized"})
        }
        req.user = payload;
        next()
    })
}