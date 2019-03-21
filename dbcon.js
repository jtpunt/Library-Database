var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DATABASEURL,
  user            : process.env.DATABASEUSER,
  password        : process.env.DATABASEPASS,
  database        : process.env.DATABASENAME
});

module.exports.pool = pool;
