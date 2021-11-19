var express        = require("express"),
    middleware     = require("../middleware"),
    sendTokenEmail = require("../emails"),
    latex          = require("../LaTeX"),
    router         = express.Router();

router.route('/')
    // RETRIEVE all Book
    .get(
        (req, res) => {
            let mysql         = req.app.get('mysql'),
                context       = {
                    publishers: []
                }
            getPublishers(res, mysql, context, complete);
            function complete(){
                res.status(200).send(context.publishers);
            }
        }
    )

module.exports = router;

function getPublishers(res, mysql, context, complete){
    let sql = 'CALL sp_get_publishers()';
    mysql.pool.query(sql, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.publishers = results[0];
        complete();
    });
}