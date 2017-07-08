'use strict';

var Log = require('mongoose').models.Log;

function createLog(option) {
    return new Promise(function(resolve, reject) {
        var log = option;

        if(log instanceof Log) {
            return resolve(log);
        } else {
            Log.create(log, function(err, logDoc) {
                if(err) {
                    return reject(err);
                }

                return resolve(logDoc);
            });
        }
    });
}

module.exports = {
    createLog: createLog
};
