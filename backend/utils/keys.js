const dotenv = require('dotenv')
dotenv.config()

const JWT_SECRET = process.env.SECRET

module.exports = JWT_SECRET