var assert     = require('assert'),
    status     = require('http-status'),
    superagent = require('superagent');

module.exports = function(wagner) {
    var url = global.URL_ROOT + '/contest'; // contest_nickname/problem

    function getAll(done) { wagner.invoke(function(loginService, assertService, contestService) {
        var me = global.me;

        contestService.createContest(null, assertService.create.bind(null, function(contestDoc) {
            var newProblems = [{
                active: true,
                name: 'First problem',
                v: [{
                    description: 'just a simple problem',
                    time_limit: 1,
                    order: 1,
                    critical: true
                }],
                solutions: []
            }, {
                active: true,
                name: 'Second problem',
                v: [{
                    description: 'just another simple problem',
                    time_limit: 1,
                    order: 2,
                    critical: true
                }],
                solutions: []
            }];
            contestDoc.problems = contestDoc.problems.concat(newProblems);

            contestDoc.save(assertService.create.bind(null, function(contestDoc) {
                superagent.get(url + '/' + contestDoc.nickname + '/problem')
                .query({ token: me.token })
                .end(assertService.apiCall.bind(null, function(result) {
                    assertService.equalRecursive(newProblems, result.problems);

                    done();
                }));
            }));
        }), me);
    })};

    function getOne(done) { wagner.invoke(function(loginService, assertService, contestService) {
        var me = global.me;

        contestService.createContest(null, assertService.create.bind(null, function(contestDoc) {
            var newProblem = {
                active: true,
                name: 'First problem',
                v: [{
                    description: 'just a simple problem',
                    time_limit: 1,
                    order: 1,
                    critical: true
                }],
                solutions: []
            };
            contestDoc.problems.push(newProblem);

            contestDoc.save(assertService.create.bind(null, function(contestDoc) {
                var insertedProblem = contestDoc.problems[0];

                superagent.get(url + '/' + contestDoc.nickname + '/problem/' + insertedProblem.nickname)
                .query({ token: me.token })
                .end(assertService.apiCall.bind(null, function(result) {
                    assertService.equalRecursive(newProblem, result.problem);

                    done();
                }));
            }));
        }), me);
    })};

    function getOneNotFound(done) { wagner.invoke(function(loginService, assertService, contestService) {
        var me = global.me;

        contestService.createContest(null, assertService.create.bind(null, function(contestDoc) {
            superagent.get(url + '/' + contestDoc.nickname + '/problem/abc')
            .query({ token: me.token })
            .end(assertService.apiError.bind(null, status.NOT_FOUND, function() {
                done();
            }));
        }), me);
    })};

    return {
        getAll:         getAll,
        getOne:         getOne,
        getOneNotFound: getOneNotFound
    };
};
