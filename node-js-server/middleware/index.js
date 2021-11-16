var middleware = {
	isPatron(req, res, next){
		if(req.session.normal_user){
	        return next();
	    }
	    req.flash("error", "You need to be logged in to do that");
	    res.redirect("/login");
	},
	isLoggedIn(req, res, next){
		console.log("in middleware is isLoggedIn fn");
	    if(req.session.normal_user || req.session.admin){
	        return next();
	    }
	    req.flash("error", "You need to be logged in to do that");
	    res.redirect("/login");
	},
	isAdmin(req, res, next){
		if(req.session.admin){
	        return next();
	    }
	    req.flash("error", "You need to be logged in to do that");
	    res.redirect("/login");
	},
	logout(req, res, next){
		req.session.destroy((err) => {
			if(err) return next(err);
			else return res.redirect("/");
		});
	}
}
module.exports = middleware
