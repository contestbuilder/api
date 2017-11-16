'use strict';

var mysql     = require('mysql'),
    configLib = require('../libraries/config.lib');

var sqlConfig = configLib.env.sql;

global.db = mysql.createConnection({
    host:     sqlConfig.host,
    user:     sqlConfig.user,
    password: sqlConfig.password,
    database: sqlConfig.database
});

global.db.connect(function(err) {
    if(err) {
        throw err;
    }

    console.log('Connected to db.');
});
