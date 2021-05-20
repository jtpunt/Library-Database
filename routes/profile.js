var express    = require("express"),
    middleware = require("../middleware"),
    router     = express.Router();

router.route('/')
	// CREATE a profile 
	.post(
		(req, res) => {
			let mysql = req.app.get('mysql');
		}
	)
	// READ a profile
	.get(middleware.isLoggedIn,
		(req, res) => {
			let context = {},
			 	mysql 	= req.app.get('mysql'),
			 	sql     = "SELECT * FROM Patron WHERE patron_id = ? LIMIT 1;",
			 	inserts = [req.session.patron_id];
			sql = mysql.pool.query(sql, inserts, function(error, results, fields){
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
						console.log(`patron_id: ${req.session.patron_id}`);
    					context.profile = results[0];
    					res.render('profile/index', context);
					}
				}
			});
		}
	)
	// UPDATE a profile
	.put(middleware.isLoggedIn,
		(req, res) => {
			let context = {},
			 	mysql 	= req.app.get('mysql');
			console.log(`in PUT -> /profile with data: ${JSON.stringify(req.body)}`);

			res.redirect('/profile');
		}
	)
// Showing books that the user has checked out
router.route('/checkout')
	.get(middleware.isLoggedIn,
		(req, res) => {
			console.log('in checkout');
			let context = {
				scripts:  ["/static/js/books.js"]
			},
			 	mysql 	= req.app.get('mysql'),
				inserts = [req.session.patron_id],
				sqlStatement = "SELECT bl.isbn, b.title, bl.return_date \
				FROM Book_Loan bl \
				INNER JOIN Book b ON bl.isbn = b.isbn \
				WHERE patron_id = ?;";

			mysql.pool.query(sqlStatement, inserts, function(error, results, fields){
                if(error){
                    console.log(`error: ${JSON.stringify(error)}`);
                    res.write(JSON.stringify(error));
                    res.end();
                }else{
                	console.log(`results: ${JSON.stringify(results)}`);
                	context.holds = results;
                	res.render('profile/checkout', context);
                }
			});
			
		}
	)
router.route('/holds')
	.get(middleware.isLoggedIn,
		(req, res) => {
			console.log('in holds');
			let context = {
				scripts:  ["/static/js/books.js"]
			},
			 	mysql 	= req.app.get('mysql'),
				inserts = [req.session.patron_id],
                sqlStatement = "SELECT br.isbn, b.title, br.reserve_date \
                FROM Book_Reservation br \
                INNER JOIN Book b ON br.isbn = b.isbn \
				WHERE patron_id = ?;";

			mysql.pool.query(sqlStatement, inserts, function(error, results, fields){
                if(error){
                    console.log(`error: ${JSON.stringify(error)}`);
                    res.write(JSON.stringify(error));
                    res.end();
                }else{
                	console.log(`results: ${JSON.stringify(results)}`);
                	context.holds = results;
                	res.render('profile/hold', context);
                }
			});
			
		}
	)

module.exports = router;