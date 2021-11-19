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
            getGenres(res, mysql, context, complete);
            function complete(){
                res.status(200).send(context.genres);
            }
        }
    )

module.exports = router;

function getGenres(res, mysql, context, complete){
    let sql = 'CALL sp_get_genres()';
    mysql.pool.query(sql, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.genres = results[0];
        complete();
    });
}