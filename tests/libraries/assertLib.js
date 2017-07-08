'use strict';

var assert   = require('assert'),
    status   = require('http-status');

function apiCall(res) {
    return Promise.resolve(res);
}

function apiStatus(expectedStatus, response) {
    assert.equal(response.statusCode, expectedStatus);

    return Promise.resolve(response.body);
}

function hasError(response) {
    assert.ok(response.error);

    return Promise.resolve(response);
}

function create(cb, err, docs) {
    assert.ifError(err);

    cb(docs);
}

function equalRecursive(obj1, obj2) {
    checkRecursive(obj1, obj2);

    return Promise.resolve(obj2);
}

function equalRecursiveBinded(obj1, prop, obj2) {
    obj2 = obj2[prop];
    checkRecursive(obj1, obj2);

    return Promise.resolve(obj2);
}

function assertLog(logsQtde, logsObj, logDocs) {
    assert.equal(logsQtde, logDocs.length);

    if(logsQtde === 1) {
        equalRecursive(logsObj, logDocs[0]);
    } else {
        equalRecursive(logsObj, logDocs);
    }

    logDocs.forEach(function(logDoc) {
        assert.ok(logDoc.message);
    });

    return Promise.resolve(logDocs);
}

function checkRecursive(obj1, obj2, comparePath, key) {
    if(!comparePath) {
        comparePath = 'root';
    }

    if(obj1 !== undefined && obj2 === undefined) {
        return assert.ok(
            false,
            'checkRecursive: Value defined on first obj but not on the second (' + comparePath + ').'
        );
    }

    if(Array.isArray(obj1)) {
        if(!Array.isArray(obj2)) {
            return assert.ok(
                false,
                'checkRecursive: Value on first object is an Array and on second isn\'t (' + comparePath + ').'
            );
        }

        obj1.forEach(function(value, index) {
            checkRecursive(obj1[index], obj2[index], comparePath + '[' + index + ']', index);
        });
    } else if(obj1 instanceof Object) {
        if(key === '_id') {
            if(obj1.toString() !== obj2) {
                assert.ok(
                    false,
                    'checkRecursive: Ids are different (' + comparePath + ').'
                );
            }
            return;
        }

        if(!(obj2 instanceof Object)) {
            return assert.ok(
                false,
                'checkRecursive: Value on first object is an Object and on second isn\'t (' + comparePath + ').'
            );
        }

        Object.keys(obj1).forEach(function(key) {
            checkRecursive(obj1[key], obj2[key], comparePath + '.' + key, key);
        });
    } else {
        assert.equal(
            obj1, obj2,
            'checkRecursive: Different value (' + comparePath + ').'
        );
    }
}

module.exports = {
    apiCall             : apiCall,
    apiStatus           : apiStatus,
    hasError            : hasError,
    create              : create,
    equalRecursive      : equalRecursive,
    equalRecursiveBinded: equalRecursiveBinded,
    assertLog           : assertLog
};
