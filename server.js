/*******************************************
* Author: Jonathan Perry
* Date: 12/03/17
* Assignment: CS 340 - Project
*******************************************/
/**********************************************************************
* The tools needed for this web application
**********************************************************************/
var express = require('express'),
	mysql = require('./dbcon.js'),
	bodyParser = require('body-parser'), // body parser middleware
	methodOverride = require("method-override"),
	flash          = require("connect-flash"),
	port = 3005,
	ip = process.env.IP,
	app = express();

// Requiring routes
var adminRoutes   = require("./routes/admin"),
    indexRoutes   = require("./routes/index"),
	bookRoutes    = require("./routes/books"),
    profileRoutes = require("./routes/profile");
/**********************************************************************
* Setup our handlebars engine for handling file extensions that end in
* 'handlebars' by registering 'handlebars' as our view engine using its
* bound 'engine' function.
**********************************************************************/
// app.engine('handlebars', handlebars.engine); 
// app.set('view engine', 'handlebars');
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('mysql', mysql);
/**********************************************************************
* Setup what type of data the server can receive via GET/POST requests
**********************************************************************/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 
app.use(methodOverride("_method"));
app.use('/static', express.static(__dirname + '/public')); // static directory is going to be our directory called public
app.use(flash()); // must be used before passport configuration

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

// w/e function we provide to it will be called on every route
app.use(function(req, res, next){
    // w/e we put in res.locals is what's available inside of our template
    res.locals.currentUser = req.session.username;
    res.locals.admin_user  = req.session.admin;
    res.locals.normal_user = req.session.normal_user;
    res.locals.patron_id   = req.session.patron_id;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
/**********************************************************************
* Setup Routes For Our Server
**********************************************************************/
app.use("/", indexRoutes);
app.use("/admin", adminRoutes);
app.use("/book", bookRoutes);
app.use("/profile", profileRoutes);
app.use(function(req,res){
    res.status(404);
    res.render('404');
});
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});// routes(app);
/**********************************************************************
* Start The Server
**********************************************************************/
app.listen(port, ip, function() {
  	console.log('Express started on http://localhost:' + port + '; press Ctrl-C to terminate.');
});
