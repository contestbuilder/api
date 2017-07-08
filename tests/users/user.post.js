'use strict';

var assert     = require('assert'),
    request    = require('request-promise'),
    assertLib  = require('../libraries').assertLib,
    status     = require('http-status');

var url = global.URL_ROOT + '/user';

function add(done) {
    var newUser = {
        username: 'test',
        password: '123',
        email   : 'test@test.com'
    };

    request({
        uri   : url,
        method: 'POST',
        body  : newUser,
        qs    : { token: global.me.token },
        json  : true
    })
        .then(function(result) {
            delete newUser.password;

            return assertLib.equalRecursive(newUser, result.user);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

function addUnlogged(done) {
    var newUser = {
        username: 'test',
        password: '123',
        email   : 'test@test.com'
    };

    request({
        uri   : url,
        method: 'POST',
        body  : newUser,
        json  : true
    })
        .then(function(result) {
            delete newUser.password;

            return assertLib.equalRecursive(newUser, result.user);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

function addFail(done) {
    var newUser = {
        username: 'test',
        password: '123'
    };

    request({
        uri                    : url,
        method                 : 'POST',
        body                   : newUser,
        json                   : true,
        simple                 : false,
        resolveWithFullResponse: true
    })
        .then(assertLib.apiStatus.bind(null, status.BAD_REQUEST))
        .then(assertLib.hasError)
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

module.exports = {
    add        : add,
    addUnlogged: addUnlogged,
    addFail    : addFail
};
