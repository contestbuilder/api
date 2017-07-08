'use strict';

var request    = require('request-promise'),
    libraries  = require('../libraries'),
    assertLib  = libraries.assertLib,
    userLib    = libraries.userLib;

var url = global.URL_ROOT + '/user';

function edit(done) {
    var newUser = {
        name    : 'test',
        username: 'test',
        password: '123',
        email   : 'test@test.com'
    };

    userLib.createUser(newUser)
        .then(function(result) {
            delete newUser.password;
            newUser.name =  'test2';

            return request({
                uri   : url + '/' + newUser.username,
                method: 'PUT',
                body  : { name: newUser.name },
                qs    : { token: global.me.token },
                json  : true
            });
        })
        .then(assertLib.equalRecursiveBinded.bind(null, newUser, 'user'))
        .then(function(result) { done(); })
        .catch(function(err) { done(err); });
};

module.exports = {
    edit: edit
};
