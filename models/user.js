var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);
var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  email: String,
  passwordDigest: String
});

// Sign Up

// create secure takes a password and email in params
userSchema.statics.createSecure = function (email, password, cb) {
  // saves the user email and hashes the password
  var that = this; // save the context
  bcrypt.genSalt(function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      console.log(hash);
      that.create({
        email: email,
        passwordDigest: hash
       }, cb)
    });
  })
};

// Sign In

userSchema.statics.encryptPassword = function (password) {
   var hash = bcrypt.hashSync(password, salt);
   return hash;
 };


userSchema.statics.authenticate = function(email, password, cb) {
  // find just one user with the email
  this.findOne({
     email: email // find user by email
    }, // then if user exits with email
    function(err, user){
      if (user === null){
        throw new Error("Username does not exist");
      } else if (user.checkPassword(password)){ // verify password
        cb(null, user); // send back the user
      } else {
        throw new Error("Invalid password");
      }
    })
 }

userSchema.methods.checkPassword = function(password) {
    return bcrypt.compareSync(password, this.passwordDigest);
};


var User = mongoose.model("User", userSchema);

module.exports = User;