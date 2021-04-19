/*******************************************
* Author: Jonathan Perry
* Date: 12/03/17
* Assignment: CS 340 - Project
*******************************************/
/**********************************************************************
* The tools needed for this web application
**********************************************************************/
var express = require('express');
var mysql = require('./dbcon.js');
// var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser'); // body parser middleware
var methodOverride = require("method-override");
var port = 3005;
var ip = process.env.IP;
var app = express();

// Requiring routes
var indexRoutes = require("./routes/index"),
	bookRoutes  = require("./routes/books");
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
/**********************************************************************
* Setup Routes For Our Server
**********************************************************************/
app.use("/", indexRoutes);
app.use("/books", bookRoutes);
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
