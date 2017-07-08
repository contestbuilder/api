var assert     = require('assert'),
    status     = require('http-status'),
    superagent = require('superagent');

module.exports = function(wagner) {
    var url = global.URL_ROOT + '/contest';

    function removeContest(done) { wagner.invoke(function(userService, Contest, assertService) {
        var newUsers = userService.newUsers(2);
        
        userService.create(newUsers, assertService.create.bind(null, function(userDocs) {
            var newContest = {
                author: userDocs[0]._id.toString(),
                name: 'Abc',
                contributors: [ 
                    userDocs[0]._id.toString(),
                    userDocs[1]._id.toString()
                ]
            };

            Contest.create(newContest, assertService.create.bind(null, function(contestDoc) {
                newContest.active = false;

                superagent.del(url + '/' + contestDoc.nickname)
                .end(assertService.apiCall.bind(null, function(result) {
                    assertService.equalRecursive(newContest, result.contest);

                    done();
                }));
            }));
        }));
    })};

    function removeContributor(done) { wagner.invoke(function(userService, Contest, assertService) {
        var newUsers = userService.newUsers(2);
        
        userService.create(newUsers, function(err, docs) {
            assert.ifError(err);

            var newContest = {
                author: docs[0]._id.toString(),
                name: 'abc',
                contributors: [ 
                    docs[0]._id.toString(),
                    docs[1]._id.toString()
                ]
            };

            Contest.create(newContest, function(err, doc) {
                assert.ifError(err);

                superagent.del(url + '/' + newContest.name + '/contributor/' + docs[1]._id.toString())
                .end(function(err, res) {
                    assert.ifError(err);

                    var result;
                    assert.doesNotThrow(function() {
                        result = JSON.parse(res.text);
                    });
                    assert.ok(result);

                    newContest.contributors = newContest.contributors.filter(function(c) {
                        return c != docs[1]._id.toString();
                    });
                    assertService.equalRecursive(newContest, result.contest);

                    done();
                });
            });
        });
    })};

    return {
        removeContest:     removeContest,
        removeContributor: removeContributor
    };
};
