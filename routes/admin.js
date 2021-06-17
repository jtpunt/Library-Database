var express    = require("express"),
    middleware = require("../middleware"),
    latex      = require("../LaTeX"),
    router     = express.Router();

router.get('/', middleware.isAdmin, function(req,res){
    res.render('admin/index');
});

module.exports = router;