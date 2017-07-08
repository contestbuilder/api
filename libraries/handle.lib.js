'use strict';

var status = require('http-status'),
    Log    = require('mongoose').models.Log;

function handleError(res, err) {
    console.trace(err);

    if(err && err.message) {
        res
            .status(err.code || status.INTERNAL_SERVER_ERROR)
            .json({ error: err.message });
    } else {
        res
            .status(status.INTERNAL_SERVER_ERROR)
            .json({error: 'Unknown error.'});
    }
}

function handleReturn(res, property, obj) {
    var json = {};
    if(property) {
        json[property] = obj;
    } else {
        json = obj;
    }
    res.json(json);

    return Promise.resolve(obj);
}

function handleFindOne(obj) {
    if(!obj) {
        return Promise.reject({
            message: 'Object not found.',
            code   : status.NOT_FOUND
        });
    }

    return Promise.resolve(obj);
}

function handleRequired(body, requiredFields) {
    var missing = [];

    requiredFields.forEach(function(field) {
        if(body[field] === undefined) {
            missing.push(field);
        }
    });

    if(missing.length) {
        return Promise.reject({
            message: 'The following fields are required and missing: ' + missing.join(', ') + '.',
            code   : status.BAD_REQUEST
        });
    }

    return Promise.resolve();
}

function handleLog(req, obj, logParams) {
    return new Promise(function(resolve, reject) {
        logParams.author = req.user._id;
        var log = new Log(logParams);

        log.save(function(err, logDoc) {
            if(err) {
                return reject(err);
            }

            return resolve(obj || logDoc);
        });
    });
}

function handlePopulate(properties, obj) {
    return obj.populate(properties)
        .execPopulate();
}

module.exports = {
    handleError   : handleError,
    handleReturn  : handleReturn,
    handleFindOne : handleFindOne,
    handleRequired: handleRequired,
    handleLog     : handleLog,
    handlePopulate: handlePopulate
};
