var assert     = require('assert'),
    status     = require('http-status'),
    superagent = require('superagent');

module.exports = function(wagner) {
    var url = global.URL_ROOT + '/contest';

    function add(done) { wagner.invoke(function(userService, Contest, assertService) {
        var newUsers = userService.newUsers(2);
        
        userService.create(newUsers, assertService.create.bind(null, function(userDocs) {
            var newContest = {
                author: userDocs[0]._id.toString(),
                name: 'abc',
                contributors: [ 
                    userDocs[0]._id.toString(), 
                    userDocs[1]._id.toString()
                ],
                problems: []
            };

            superagent.post(url)
            .send(newContest)
            .end(assertService.apiCall.bind(null, function(result) {
                assertService.equalRecursive(newContest, result.contest);

                done();
            }));
        }));
    })};

    function addFail(done) { wagner.invoke(function(userService, Contest, assertService) {
        var newUsers = userService.newUsers(2);
        
        userService.create(newUsers, assertService.create.bind(null, function(userDocs) {
            var newContest = {
                name: 'abc',
                contributors: [ 
                    userDocs[0]._id.toString(), 
                    userDocs[1]._id.toString()
                ]
            };

            superagent.post(url)
            .send(newContest)
            .end(assertService.apiError.bind(null, status.BAD_REQUEST, function() {
                done();
            }));
        }));
    })};

    function addContributor(done) { wagner.invoke(function(userService, Contest, assertService) {
        var newUsers = userService.newUsers(2);
        
        userService.create(newUsers, function(err, docs) {
            assert.ifError(err);

            var newContest = {
                author: docs[0]._id.toString(),
                name: 'abc',
                contributors: [ 
                    docs[0]._id.toString()
                ]
            };

            Contest.create(newContest, function(err, doc) {
                assert.ifError(err);

                superagent.post(url + '/' + newContest.name + '/contributor')
                .send({
                    user_id: docs[1]._id.toString()
                })
                .end(function(err, res) {
                    assert.ifError(err);

                    var result;
                    assert.doesNotThrow(function() {
                        result = JSON.parse(res.text);
                    });
                    assert.ok(result);

                    newContest.contributors.push(docs[1]._id.toString());
                    assertService.equalRecursive(newContest, result.contest);

                    done();
                });
            });
        });
    })};

    return {
        add:            add,
        addFail:        addFail,
        addContributor: addContributor
    };
};
