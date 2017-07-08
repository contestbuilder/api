var superagent = require('superagent');

module.exports = function(wagner) {
    wagner.factory('loginService', function(User) {

        var factory = this;
        
        function login() {
            return new Promise(function(resolve, reject) {
                User.create({
                    username: 'crbonilha',
                    password: '123',
                    email: 'cristhian@bonilha.com'
                }, function(err, userDoc) {
                    if(err) {
                        return reject(err);
                    }

                    factory.myUser = userDoc;
                    superagent.post(global.URL_ROOT + '/login')
                    .send({
                        username: 'crbonilha',
                        password: '123'
                    })
                    .end(function(err, loginDoc) {
                        if(err) {
                            return reject(err);
                        }

                        factory.myUser.token = loginDoc.body.token;
                        return resolve(factory.myUser);
                    });
                });
            });
        }

        function me() {
            return factory.myUser;
        }

        return {
            login: login,
            me:    me
        };
    });
}
