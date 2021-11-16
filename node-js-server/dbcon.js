var mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DATABASEURL,
  user            : process.env.DATABASEUSER,
  password        : process.env.DATABASEPASS,
  database        : process.env.DATABASENAME
});

module.exports.pool = pool;
