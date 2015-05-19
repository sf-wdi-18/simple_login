// models/index.js
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/simple_login");

// db.User
module.exports.User = require("./user")