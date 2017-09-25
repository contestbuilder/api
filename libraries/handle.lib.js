'use strict';

var status = require('http-status'),
    Log    = require('mongoose').models.Log;

function handleError(res, err) {
    console.trace(err);

    if(err && err.message) {
        res
            .status(err.status_code || status.INTERNAL_SERVER_ERROR)
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
            message:     'Object not found.',
            status_code: status.NOT_FOUND
        });
    }

    return Promise.resolve(obj);
}

function handleAggregationFindOne(obj) {
    if(!obj || !Array.isArray(obj) || obj.length !== 1) {
        if(!obj) {
            console.log('no object');
        } else if(!Array.isArray(obj)) {
            console.log('not an array');
        } else {
            console.log('length', obj.length);
        }

        return Promise.reject({
            message:     'Object not found.',
            status_code: status.NOT_FOUND
        });
    }

    return Promise.resolve(obj[0]);
}

function handleRequired(body, requiredFields) {
    var missing = [];

    requiredFields.forEach(function(field) {
        if(Array.isArray(field)) {
            if(field.every(function(subfield) {
                return body[subfield] === undefined;
            })) {
                missing = missing.concat(field);
            }
        }
        else if(body[field] === undefined) {
            missing.push(field);
        }
    });

    if(missing.length) {
        return Promise.reject({
            message:     'The following required fields are missing: ' + missing.join(', ') + '.',
            status_code: status.BAD_REQUEST
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
    handleError:              handleError,
    handleReturn:             handleReturn,
    handleFindOne:            handleFindOne,
    handleAggregationFindOne: handleAggregationFindOne,
    handleRequired:           handleRequired,
    handleLog:                handleLog,
    handlePopulate:           handlePopulate
};
