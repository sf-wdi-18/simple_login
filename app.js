var express = require('express'),
    bodyParser = require('body-parser'),
    db = require("./models"),
    session = require("express-session"),
    app = express(),
    path = require("path");


var views = path.join(process.cwd(), "views");

app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
	secret: "super secret",
	resave: false,
	saveUninitialized: true
}))

app.use("/", function (req, res, next) {

    req.login = function (user) {
      req.session.userId = user._id;
      console.log(user);
    };

    // fetches the user associated with
    //the current session
    req.currentUser = function (cb) {
       db.User.
        findOne({
        	_id: req.session.userId
        },
        function (err, user) {
          req.user = user;
          console.log(user);
          cb(null, user);
        })
    };

    req.logout = function () {
      req.session.userId = null;
      req.user = null;
    }

    next(); 
});

app.get("/signup", function (req, res) {
    res.sendFile(path.join(views, "signup.html"));
});

// app.post("/signup", function (req, res) {
// 	// decalre variable for form data
// 	var user = req.body;
// 	console.log(user);
// 	db.User. // call encryptPassword to store hashed password
// 		encryptPassword(user.email, user.password)
// })

// where users will POST DATA to create an account
app.post("/signup", function (req, res) {
	// grab User params from req
	var user = req.body.user;
	console.log(user);
	
	db.User. // call createSecure with that email & password
		createSecure(user.email, user.password, 
			function (err, user) { // runs after db.User.create finishes
				// sends the response back to the user
				if (err) {
					res.redirect("/signup");
				} else {
					req.login(user);
					res.redirect("/profile");
				}
			});
});

app.post("/login", function (req, res) {
	var user = req.body.user;
	console.log(user)
	db.User.
		authenticate(user.email, user.password,
			function(err, user) {
				console.log("LOGGING IN!");
				req.login(user);
				res.redirect("/profile");
			});
});

app.get("/profile", function (req, res) {
	req.currentUser(function (err, user) {
		console.log(user);
		res.send("Welcome " + user.email);
	});
});

app.get("/login", function (req, res) {
	res.sendFile(path.join(views, "login.html"));
});

app.listen(3000, function () {
  console.log("SERVER RUNNING");
});