'use strict';

var User = require('mongoose').models.User;

function newUser() {
    return {
        username: 'user_' + Math.random().toString(36).substring(7),
        password: '123',
        email   : 'test@test.com'
    };
}

function newUsers(qty) {
    var users = [];
    for(var i = 0; i < qty; i++) {
        users.push(newUser());
    }
    return users;
}

function createUser(option) {
    return new Promise(function(resolve, reject) {
        var user;
        if(typeof option === 'number') {
            user = newUsers(option);
        }
        else if(option !== null && typeof option === 'object') {
            user = option;
        }
        else {
            user = newUser();
        }

        if(user instanceof User) {
            return resolve(user);
        } else {
            User.create(user, function(err, userDoc) {
                if(err) {
                    return reject(err);
                }

                return resolve(userDoc);
            });
        }
    });
}

module.exports = {
    newUser   : newUser,
    newUsers  : newUsers,
    createUser: createUser
};
