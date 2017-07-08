var assert     = require('assert'),
    status     = require('http-status'),
    superagent = require('superagent');

module.exports = function(wagner) {
    var url = global.URL_ROOT + '/contest';

    function edit(done) { wagner.invoke(function(userService, Contest, assertService) {
        var newUser = userService.newUser();
        
        userService.create(newUser, assertService.create.bind(null, function(userDoc) {
            var newContest = {
                author: userDoc._id.toString(),
                name: 'abc',
                contributors: [ 
                    userDoc._id.toString(), 
                    userDoc._id.toString()
                ]
            };

            Contest.create(newContest, assertService.create.bind(null, function(contestDoc) {
                var newName = 'def';
                newContest.name = newName;

                superagent.put(url + '/' + contestDoc.nickname)
                .send({
                    name: newName
                })
                .end(assertService.apiCall.bind(null, function(result) {
                    assertService.equalRecursive(newContest, result.contest);

                    done();
                }));
            }));
        }));
    })};

    return {
        edit: edit
    };
};
