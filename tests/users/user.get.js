'use strict';

var status     = require('http-status'),
    request    = require('request-promise'),
    libraries  = require('../libraries'),
    loginLib   = libraries.loginLib,
    userLib    = libraries.userLib,
    assertLib  = libraries.assertLib;

var url = global.URL_ROOT + '/user';

function getAll(done) {
    var me       = global.me;
    var newUsers = userLib.newUsers(2);

    userLib.createUser(newUsers)
        .then(function(userDocs) {
            newUsers.unshift({
                username: me.username,
                email   : me.email
            });
            delete newUsers[1].password;
            delete newUsers[2].password;

            return request({
                uri : url,
                qs  : { token: me.token },
                json: true
            });
        })
        .then(assertLib.equalRecursiveBinded.bind(null, newUsers, 'users'))
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

function getOne(done) {
    var newUser = userLib.newUser();

    userLib.createUser(newUser)
        .then(function(userDoc) {
            delete newUser.password;

            return request({
                uri : url + '/' + newUser.username,
                qs  : { token: global.me.token },
                json: true
            });
        })
        .then(assertLib.equalRecursiveBinded.bind(null, newUser, 'user'))
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

function getOneNotFound(done) {
    request({
        uri                    : url + '/abc',
        qs                     : { token: global.me.token },
        json                   : true,
        simple                 : false,
        resolveWithFullResponse: true
    })
        .then(assertLib.apiStatus.bind(null, status.NOT_FOUND))
        .then(assertLib.hasError)
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

module.exports = {
    getAll        : getAll,
    getOne        : getOne,
    getOneNotFound: getOneNotFound
};
