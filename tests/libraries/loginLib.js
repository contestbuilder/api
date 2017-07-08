'use strict';

var request = require('request-promise'),
    userLib = require('./userLib');

function login() {
    return new Promise(function(resolve, reject) {
        var userDoc;
        var username = 'crbonilha';
        var password = '123';

        userLib.createUser({
            username: username,
            password: password,
            email   : 'cristhian@bonilha.com'
        })
            .then(function(result) {
                userDoc = result;

                return request({
                    uri   : global.URL_ROOT + '/login',
                    method: 'POST',
                    body  : {
                        username: username,
                        password: password
                    },
                    json  : true
                });
            })
            .then(function(result) {
                userDoc.token = result.token;

                return resolve(userDoc);
            })
            .catch(reject);
    });
}

module.exports = {
    login: login
};
