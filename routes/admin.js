var express    = require("express"),
    middleware = require("../middleware"),
    latex      = require("../LaTeX"),
    router     = express.Router();

router.get('/', middleware.isAdmin, function(req,res){
	// Retrieve all books that are on hold
    res.render('admin/index');
});
router.get('/hold', middleware.isAdmin, function(req,res){
	let context = { scripts:  ["/static/js/admin/deleteHold.js"] },
		mysql 	= req.app.get('mysql'),
		sql   	= `CALL sp_get_holds()`;

	mysql.pool.query(sql, function(error, results, fields){
        if(error){
            console.log(`error: ${JSON.stringify(error)}`);
            res.write(JSON.stringify(error));
            res.end();
        }else{
        	console.log(`results: ${JSON.stringify(results)}`);
        	context.holds = results[0];
        	res.render('admin/hold', context);
        }
	});
});
router.get('/hold/late', middleware.isAdmin, function(req,res){
    let context = { scripts:  ["/static/js/admin/deleteHold.js"] },
        mysql   = req.app.get('mysql'),
        sql     = `CALL sp_get_past_due_holds()`;

    mysql.pool.query(sql, function(error, results, fields){
        if(error){
            console.log(`error: ${JSON.stringify(error)}`);
            res.write(JSON.stringify(error));
            res.end();
        }else{
            console.log(`results: ${JSON.stringify(results)}`);
            context.holds = results[0];
            res.render('admin/late', context);
        }
    });
});
module.exports = router;