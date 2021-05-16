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
router.get('/:patron_id/edit', middleware.isLoggedIn, (req, res) => {
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
            }else {
                console.log(`RESULTS: ${JSON.stringify(results)}`);
				console.log(`patron_id: ${req.session.patron_id}`);
				context.profile = results[0];
				res.render('profile/edit', context);
			}
		}
	});
})
module.exports = router;