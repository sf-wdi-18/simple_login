var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);
var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  email: String,
  passwordDigest: String
});

// SIGN UP

// create secure takes a password and email in params
userSchema.statics.createSecure = function (email, password, cb) {
  // saves the user email and hashes the password
  var that = this; // save the context 

  // generate the salt
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


//SIGN IN
userSchema.statics.encryptPassword = function (password) {
   var hash = bcrypt.hashSync(password, salt);
   return hash;
 };


userSchema.statics.authenticate = function(email, password, cb) {
  // find just one user with the email 
  this.findOne({
     email: email // find user by email
    }, // then if user exists with that email
    function(err, user){
      console.log(user);
      if (user === null){
        throw new Error("Username does not exist");
      } else if (user.checkPassword(password)){ // verify password
        cb(null, user); // send back that user
      }

    })
 }
userSchema.methods.checkPassword= function(password) {
        return bcrypt.compareSync(password, this.passwordDigest);
};


var User = mongoose.model("User", userSchema);

module.exports = User;