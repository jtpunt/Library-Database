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
                    authors: []
                }
            getAuthors(res, mysql, context, complete);
            function complete(){
                res.status(200).send(context.authors);
            }
        }
    )

module.exports = router;

function getAuthors(res, mysql, context, complete){
    let sql = 'CALL sp_get_authors()';
    mysql.pool.query(sql, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.authors = results[0];
        console.log(`author results: ${JSON.stringify(results)}`);
        complete();
    });
}