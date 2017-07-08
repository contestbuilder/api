var superagent = require('superagent');

module.exports = function(wagner) {
    wagner.factory('userService', function(User) {

        function newUser() {
            return {
                username: 'user_' + Math.random().toString(36).substring(7),
                password: '123',
                email: 'test@test.com'
            };
        }

        function newUsers(qty) {
            var users = [];
            for(var i=0; i<qty; i++) {
                users.push(newUser());
            }
            return users;
        }

        function createUser(option, cb) {
            var user;
            if(typeof option == 'number') {
                user = newUsers(option);
            }
            else if(option !== null && typeof option == 'object') {
                user = option;
            }
            else {
                user = newUser();
            }

            if(user instanceof User) {
                cb(null, user);
            } else {
                User.create(user, cb);
            }
        }

        return {
            newUser:    newUser,
            newUsers:   newUsers,
            createUser: createUser
        };
    });
}
