var express = require('express'),
    app = express();

var path = require("path"),
	views = path.join(process.cwd(), "views");

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

var session = require("express-session");
app.use(session({
	secret: "super secret",
	resave: false,
	saveUninitialized: true
}));


var db = require("./models");


// our custom session management /
// database interaction middleware    
app.use("/", function (req, res, next) {

	// sets the user for the current session
    req.login = function (user) {
      req.session.userId = user._id;
      console.log(user);
    };

    // from db, fetches the user associated with
    //  the current session
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

    // resets the current user to null 
    req.logout = function () {
      req.session.userId = null;
      req.user = null;
    }

    next(); 
});

app.get("/signup", function (req, res) {
    res.sendFile(path.join(views, "signup.html"));
});


// where users will POST DATA to create an account
app.post("/signup", function (req, res) {
	// grab User params from req.body (form data)
	var user = req.body.user;
	console.log(user);
	
	db.User. // call createSecure with that email & password
		createSecure(user.email, user.password, 
			function (err, user) { // runs after db.User.create finishes
				// sends the response back to the user
				if (err) {
					res.redirect("/signup");
				} else {
					// rememer to log the user in on signup or we'll get 
					// profile for null!
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