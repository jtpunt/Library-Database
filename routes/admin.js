var express    = require("express"),
    middleware = require("../middleware"),
    latex      = require("../LaTeX"),
    router     = express.Router();

router.get('/', middleware.isAdmin, function(req,res){
	// Retrieve all books that are on hold
    res.render('admin/index');
});

module.exports = router;