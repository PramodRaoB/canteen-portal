const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const PORT = 4000;
const DB_NAME = "canteenPortal"


// routes
const authRouter = require("./routes/auth");
const tokenAuth = require("./middleware/login");
const productRouter = require("./routes/product");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connection to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/' + DB_NAME, { useNewUrlParser: true });
// require("./models/Users")
// require("./models/Buyer")
// require("./models/Vendor")
mongoose.connection.once('open', function() {
    console.log("MongoDB database connection established successfully !");
})


// setup API endpoints
app.use("/api/auth", authRouter);
app.use(tokenAuth);
app.use("/api/product", productRouter);

app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});
