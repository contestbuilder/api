var assert     = require('assert'),
    status     = require('http-status'),
    superagent = require('superagent');

module.exports = function(wagner) {
    var url = global.URL_ROOT + '/contest'; // :nickname/problem/:problem_nickname

    function removeProblem(done) { wagner.invoke(function(contestService, assertService) {
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
                superagent.del(url + '/' + contestDoc.nickname + '/problem/' + contestDoc.problems[0].nickname)
                .end(assertService.apiCall.bind(null, function(result) {
                    assertService.equalRecursive([], result.contest.problems);

                    done();
                }));
            }));
        }));
    })};

    function removeProblem2(done) { wagner.invoke(function(contestService, assertService) {
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
                superagent.del(url + '/' + contestDoc.nickname + '/problem/' + contestDoc.problems[0].nickname)
                .end(assertService.apiCall.bind(null, function(result) {
                    assertService.equalRecursive([{
                        active: true,
                        name: 'Second problem',
                        v: [{
                            description: 'just another simple problem',
                            time_limit: 1,
                            order: 2,
                            critical: true
                        }, {
                            description: 'just another simple problem',
                            time_limit: 1,
                            order: 1,
                            critical: false
                        }],
                        solutions: []
                    }], result.contest.problems);

                    done();
                }));
            }));
        }));
    })};

    return {
        removeProblem:  removeProblem,
        removeProblem2: removeProblem2
    };
};
