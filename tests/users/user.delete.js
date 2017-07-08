'use strict';

var request    = require('request-promise'),
    libraries  = require('../libraries'),
    assert     = require('assert'),
    assertLib  = libraries.assertLib,
    userLib    = libraries.userLib;

var url = global.URL_ROOT + '/user';

function remove(done) {
    var newUser = {
        username: 'test',
        password: '123',
        email   : 'test@test.com'
    };

    userLib.createUser(newUser)
        .then(function(result) {
            delete newUser.password;

            return request({
                uri   : url + '/' + newUser.username,
                method: 'DELETE',
                qs    : { token: global.me.token },
                json  : true
            });
        })
        .then(assertLib.equalRecursiveBinded.bind(null, newUser, 'user'))
        .then(function(userDoc) {
            assert.ok(userDoc.deleted_at !== undefined);

            return Promise.resolve(userDoc);
        })
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

module.exports = {
    remove: remove
};
