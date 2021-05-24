/*******************************************
* Author: Jonathan Perry
* Date: 12/03/17
* Assignment: CS 340 - Project
*******************************************/
var express    = require("express"),
    middleware = require("../middleware"),
    router     = express.Router();

router.get('/',function(req,res){
    var context = {};
    context.stylesheets = ["/static/css/home.css"];
    res.render('home', context);
});
// accounts route
router.get('/login', function(req, res){
    res.render('login');
});
// This route handles the process of logging in a user to the website by
// querying the database to make sure that the user exists in the database.
// If the user does exist and their password is correct, we see if 
// they're an admin user or regular user and then redirect them to their 
// main dashboard page
router.post('/login', function(req, res){
    console.log("IN LOGIN - POST");
    var mysql = req.app.get('mysql');
    var sql = "SELECT * FROM Patron WHERE email = ? AND password = ? LIMIT 1;";
    var inserts = [req.body.email, req.body.password]; 
    var redirect = "/book"; // Go to Book page by default
    console.log(inserts);     
    sql = mysql.pool.query(`CALL sp_get_patron_by_email_and_pass(${mysql.pool.escape(req.body.email)}, ${mysql.pool. escape(req.body.password)})`, function(error, results, fields){
        if(error){
            console.log(JSON.stringify(error))
            res.write(JSON.stringify(error));
            res.end();
        }else{
            if (results[0] == undefined) {
                req.flash("error", "User not found!");
                res.redirect('/login');
            }
            else {
                console.log(`RESULTS: ${JSON.stringify(results)}`);
                if(results[0][0].admin_permission){ // admin user
                    req.session.admin = true;
                    req.session.normal_user = false;
                }else{ // normal user
                    console.log("Normal user logged in");
                    req.session.normal_user = true;
                    req.session.admin = false;
                    redirect = "/"; // Go to user dashboard
                }
                req.session.patron_id = results[0][0].patron_id;
                req.session.username = results[0][0].first_name + ' ' + results[0][0].last_name;
                console.log(`fullname - ${req.session.username}`);
                req.flash("success", "Successfully logged in as " + req.session.username + ".");
                res.redirect(redirect);
            }
        }
    });
});
// This route handles the process for logging a user out, where the request and response
// objects are passed to the middleware.logout function, where all of the logic to handle
// logging out is stored
router.get("/logout", middleware.logout)
// This route shows the forgot password form where the user can recover their password
router.get("/forgot", function(req, res){
    console.log("Show forgot form");
    res.render("forgot");
});
// This route handles the process for resetting a user's password if they cannot log in.
// To reset the password, the user must enter in their new password and enter in the secret
// they set when they created their account
router.post("/forgot", function(req, res){
    var mysql = req.app.get('mysql');
    var stylesheets = null;
    var scripts = null;
    var redirect = "/";
    var sql = "SELECT id FROM User WHERE username = ? AND secret = ?;";
    console.log("in post /forgot");
    var inserts = [req.body.username, req.body.secret]; 
    var inserts1 = [req.body.password1, req.body.password2];
    // make sure the user is in the database first before trying to update their password
    mysql.pool.query(sql, inserts, (error, results, fields) => {
        if(error){
            req.flash("error", JSON.stringify(error));
            console.log(JSON.stringify(error));
            res.redirect(redirect);
        }else if(results[0] == undefined){
            req.flash("error", "username not found!");
            res.redirect(redirect);
        }else{ // user was successfully found, proceed to reset password   
            console.log(results);
            // make sure the passwords the user entered are the same
            if(inserts1[0] !== inserts1[1]){ 
                req.flash("error", "Passwords entered do not match!");
                res.redirect(redirect);
            }
            var sql = "UPDATE User SET password=? WHERE id=?;"
            var inserts = [req.body.password1, results[0].id];
            mysql.pool.query(sql, inserts, (error, results, fields) => {
                if(error){
                    req.flash("error", JSON.stringify(error));
                    res.redirect(redirect);
                }else if(results.affectedRows == 0){
                    req.flash("error",  "password not updated");
                    res.redirect(redirect);
                }else{
                    console.log(results);
                    req.flash("success", "Password successfully updated!");
                    res.redirect(redirect);
                }
            });
        }
    });
});
module.exports = router;
