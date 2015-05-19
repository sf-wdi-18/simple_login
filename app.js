var express = require('express'),
    bodyParser = require('body-parser'),
    db = require("./models"), // require the models for db
    session = require("express-session"),
    app = express();

app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
  secret: "super secret",
  resave: false,
  saveUninitialized: true
}));

var path = require("path");
var views = path.join(process.cwd(), "views");

app.use("/", function (req, res, next) {

  // logs in a user by saving their
  // userId
  req.login = function (user) {
    // user  ~ {email:  "jane@jane.com", _id: ASDF}
    // setting user's session to store their _id
    req.session.userId = user._id;
  };

  // fetches the user associated with
  // the current session
  req.currentUser = function (cb) {
     db.User.
      findOne({
          _id: req.session.userId
      },
      function (err, user) {
        req.user = user;
        cb(null, user);
      })
  };

  // clears the session's userId field
  req.logout = function () {
    req.session.userId = null;
    req.user = null;
  }

  next(); 
});

app.get("/signup", function (req, res) {
  res.send("Coming soon");
});

// where users will POST DATA to create an account
app.post("/users", function (req, res) {
  console.log(req.body.user);
  // grab the User params from the request
  var newUser = req.body.user;

  db.User. // call createSecure with that email & password
    createSecure(newUser.email, newUser.password, 
      function (err, user) { // runs after db.User.create finishes
          // sends the response back to the user
          res.send("SIGNED UP!!!")
      });
});

// we will type in user password and email into
// a form then post it to this route to login
app.post("/login", function (req, res) {
  var user = req.body.user;
  db.User.
    authenticate(user.email, user.password,
      function (err, user) {
        console.log("LOGGING IN!!!");
        req.login(user);
        res.redirect("/profile")
      });
});

app.get("/profile", function (req, res) {
  req.currentUser(function (err, user) {
    res.send("WELCOME " + user.email)
  });
});


// login
app.get("/login", function (req, res) {
  var loginPath = path.join(views, "login.html");
  res.sendFile(loginPath);
});


app.listen(3000, function () {
  console.log("SERVER RUNNING");
});






