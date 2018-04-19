'use strict';

var mysql     = require('mysql'),
    configLib = require('../libraries/config.lib');

var sqlConfig = configLib.env.sql;

var dbPool = mysql.createPool({
	connectionLimit: sqlConfig.connectionLimit || 10,
    host:            sqlConfig.host,
    user:            sqlConfig.user,
    password:        sqlConfig.password,
    database:        sqlConfig.database
});

module.exports = function(req, res, next) {
	console.log('pool');
	dbPool.getConnection((err, conn) => {
		if(err) {
			return next(err);
		}

		req.conn = conn;
		return next();
	});
};
