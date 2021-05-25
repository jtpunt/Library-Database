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
			let context   = {},
			 	mysql 	  = req.app.get('mysql'),
			 	patron_id = req.session.patron_id,
			 	sql       = `CALL sp_get_patron_by_patron_id(?)`;

			sql = mysql.pool.query(sql, patron_id, function(error, results, fields){
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
    					context.profile = results[0][0];
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
	// DELETE a profile
	.delete(middleware.isLoggedIn,
		(req, res) => {
			res.end();
		}

	)
// Showing books that the user has placed on hold
router.route('/holds')
	.get(middleware.isLoggedIn,
		(req, res) => {
			console.log('in checkout');
			let context   = { scripts:  ["/static/js/books.js"] },
			 	mysql 	  = req.app.get('mysql'),
				patron_id = req.session.patron_id,
				sql       = `CALL sp_get_books_checked_out_by_patron_id(?)`;

			mysql.pool.query(sql, patron_id, function(error, results, fields){
                if(error){
                    console.log(`error: ${JSON.stringify(error)}`);
                    res.write(JSON.stringify(error));
                    res.end();
                }else{
                	console.log(`results: ${JSON.stringify(results)}`);
                	context.holds = results[0];
                	res.render('profile/hold', context);
                }
			});
			
		}
	)
router.route('/reservations')
	.get(middleware.isLoggedIn,
		(req, res) => {
			console.log('in holds');
			let context   = { scripts:  ["/static/js/books.js"] },
			 	mysql 	  = req.app.get('mysql'),
			 	patron_id = req.session.patron_id,
			 	sql       = `CALL sp_get_books_reserved_by_patron_id(?)`;

			mysql.pool.query(sql, patron_id, function(error, results, fields){
                if(error){
                    console.log(`error: ${JSON.stringify(error)}`);
                    res.write(JSON.stringify(error));
                    res.end();
                }else{
                	console.log(`results: ${JSON.stringify(results)}`);
                	context.holds = results[0];
                	res.render('profile/reservation', context);
                }
			});
			
		}
	)

module.exports = router;