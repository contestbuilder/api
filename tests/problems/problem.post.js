var assert     = require('assert'),
    status     = require('http-status'),
    superagent = require('superagent');

module.exports = function(wagner) {
    var url = global.URL_ROOT + '/contest';

    function add(done) { wagner.invoke(function(loginService, assertService, contestService) {
        var me = global.me;

        contestService.createContest(null, assertService.create.bind(null, function(contestDoc) {
            var problem = {
                active: true,
                name: 'First problem',
                description: 'just a simple problem',
                time_limit: 1,
                solutions: []
            };

            superagent.post(url + '/' + contestDoc.nickname + '/problem')
            .send(problem)
            .query({ token: me.token })
            .end(assertService.apiCall.bind(null, function(result) {
                assertService.equalRecursive({
                    active:  problem.active,
                    name:    problem.name,
                    v: [{
                        description: problem.description,
                        time_limit:  problem.time_limit,
                        order:       1,
                        critical:    true
                    }],
                    solutions: []
                }, result.problem);

                done();
            }));
        }), me);
    })};

    function addTwo(done) { wagner.invoke(function(loginService, assertService, contestService) {
        var me = global.me;

        contestService.createContest(null, assertService.create.bind(null, function(contestDoc) {
            var problems = [{
                active: true,
                name: 'First problem',
                description: 'just a simple problem',
                time_limit: 1,
                solutions: []
            }, {
                active: true,
                name: 'Second problem',
                description: 'just a simple problem',
                time_limit: 1,
                solutions: []
            }];

            superagent.post(url + '/' + contestDoc.nickname + '/problem')
            .send(problems[0])
            .query({ token: me.token })
            .end(assertService.apiCall.bind(null, function(result) {
                assertService.equalRecursive({
                    active:  problems[0].active,
                    name:    problems[0].name,
                    v: [{
                        description: problems[0].description,
                        time_limit:  problems[0].time_limit,
                        order:       1,
                        critical:    true
                    }],
                    solutions: []
                }, result.problem);

                superagent.post(url + '/' + contestDoc.nickname + '/problem')
                .send(problems[1])
                .query({ token: me.token })
                .end(assertService.apiCall.bind(null, function(result) {
                    assertService.equalRecursive({
                        active:  problems[1].active,
                        name:    problems[1].name,
                        v: [{
                            description: problems[1].description,
                            time_limit:  problems[1].time_limit,
                            order:       2,
                            critical:    true
                        }]
                    }, result.problem);

                    done();
                }));
            }));
        }), me);
    })};

    function addFail(done) { wagner.invoke(function(loginService, contestService, assertService) {
        var me = global.me;

        contestService.createContest(null, assertService.create.bind(null, function(contestDoc) {
            var problem = {
                active: true,
                description: 'just a simple problem',
                time_limit: 1,
                solutions: []
            };

            superagent.post(url + '/' + contestDoc.nickname + '/problem')
            .send(problem)
            .query({ token: me.token })
            .end(assertService.apiError.bind(null, status.BAD_REQUEST, function() {
                done();
            }));
        }), me);
    })};

    function addLog(done) { wagner.invoke(function(loginService, contestService, assertService, Log) {
        var me = global.me;

        contestService.createContest(null, assertService.create.bind(null, function(contestDoc) {
            var problem = {
                active: true,
                name: 'First problem',
                description: 'just a simple problem',
                time_limit: 1,
                solutions: []
            };

            superagent.post(url + '/' + contestDoc.nickname + '/problem')
            .send(problem)
            .query({ token: me.token })
            .end(assertService.apiCall.bind(null, function(result) {
                Log.find({
                    problem: result.problem._id
                }, assertService.assertLog.bind(null, 1, {
                    author: me._id.toString(),
                    contest: contestDoc._id,
                    problem: result.problem._id
                }, function(logDocs) {
                    done();
                }));
            }));
        }), me);
    })};

    return {
        add:     add,
        addTwo:  addTwo,
        addFail: addFail,
        addLog:  addLog
    };
};
