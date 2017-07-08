var assert     = require('assert'),
    status     = require('http-status'),
    superagent = require('superagent');

module.exports = function(wagner) {
    var url = global.URL_ROOT + '/contest';

    function editNonCritical(done) { wagner.invoke(function(assertService, contestService) {
        contestService.createContest(null, assertService.create.bind(null, function(contestDoc) {
            var problem = {
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
            contestDoc.problems.push(problem);

            contestDoc.save(assertService.create.bind(null, function(contestDoc) {
                var newDescription = 'just a simple problem, edited';
                problem.v.push({
                    description: newDescription,
                    time_limit: 1,
                    order: 1,
                    critical: false
                });

                superagent.put(url + '/' + contestDoc.nickname + '/problem/' + contestDoc.problems[0].nickname)
                .send({
                    description: newDescription
                })
                .end(assertService.apiCall.bind(null, function(result) {
                    assertService.equalRecursive(problem, result.problem);

                    done();
                }));
            }));
        }));
    })};

    function editCritical(done) { wagner.invoke(function(assertService, contestService) {
        contestService.createContest(null, assertService.create.bind(null, function(contestDoc) {
            var problem = {
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
            contestDoc.problems.push(problem);

            contestDoc.save(assertService.create.bind(null, function(contestDoc) {
                var newTimeLimit = 2;
                problem.v.push({
                    description: 'just a simple problem',
                    time_limit: newTimeLimit,
                    order: 1,
                    critical: true
                });

                superagent.put(url + '/' + contestDoc.nickname + '/problem/' + contestDoc.problems[0].nickname)
                .send({
                    time_limit: newTimeLimit
                })
                .end(assertService.apiCall.bind(null, function(result) {
                    assertService.equalRecursive(problem, result.problem);

                    done();
                }));
            }));
        }));
    })};

    function editOrderAsc(done) { wagner.invoke(function(assertService, Contest, contestService) {
        contestService.createContest(null, assertService.create.bind(null, function(contestDoc) {
            var problems = [{
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
            }, {
                active: true,
                name: 'Third problem',
                v: [{
                    description: 'just one more simple problem',
                    time_limit: 1,
                    order: 3,
                    critical: true
                }],
                solutions: []
            }];
            contestDoc.problems = contestDoc.problems.concat(problems);

            contestDoc.save(assertService.create.bind(null, function(contestDoc) {
                problems[0].v.push({
                    description: 'just a simple problem',
                    time_limit: 1,
                    order: 3,
                    critical: false
                });
                problems[1].v.push({
                    description: 'just another simple problem',
                    time_limit: 1,
                    order: 1,
                    critical: false
                });
                problems[2].v.push({
                    description: 'just one more simple problem',
                    time_limit: 1,
                    order: 2,
                    critical: false
                });

                superagent.put(url + '/' + contestDoc.nickname + '/problem/' + contestDoc.problems[0].nickname)
                .send({
                    order: 3
                })
                .end(assertService.apiCall.bind(null, function(result) {
                    assertService.equalRecursive(problems[0], result.problem);

                    Contest.findOne({
                        nickname: contestDoc.nickname
                    }, function(err, contestDoc) {
                        assert.ifError(err);

                        assertService.equalRecursive(problems, contestDoc.problems);

                        done();
                    });
                }));
            }));
        }));
    })};

    function editOrderDesc(done) { wagner.invoke(function(assertService, Contest, contestService) {
        contestService.createContest(null, assertService.create.bind(null, function(contestDoc) {
            var problems = [{
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
            }, {
                active: true,
                name: 'Third problem',
                v: [{
                    description: 'just one more simple problem',
                    time_limit: 1,
                    order: 3,
                    critical: true
                }],
                solutions: []
            }];
            contestDoc.problems = contestDoc.problems.concat(problems);

            contestDoc.save(assertService.create.bind(null, function(contestDoc) {
                problems[0].v.push({
                    description: 'just a simple problem',
                    time_limit: 1,
                    order: 2,
                    critical: false
                });
                problems[1].v.push({
                    description: 'just another simple problem',
                    time_limit: 1,
                    order: 3,
                    critical: false
                });
                problems[2].v.push({
                    description: 'just one more simple problem',
                    time_limit: 1,
                    order: 1,
                    critical: false
                });

                superagent.put(url + '/' + contestDoc.nickname + '/problem/' + contestDoc.problems[2].nickname)
                .send({
                    order: 1
                })
                .end(assertService.apiCall.bind(null, function(result) {
                    assertService.equalRecursive(problems[2], result.problem);

                    Contest.findOne({
                        nickname: contestDoc.nickname
                    }, function(err, contestDoc) {
                        assert.ifError(err);

                        assertService.equalRecursive(problems, contestDoc.problems);

                        done();
                    });
                }));
            }));
        }));
    })};

    return {
        editNonCritical: editNonCritical,
        editCritical:    editCritical,
        editOrderAsc:    editOrderAsc,
        editOrderDesc:   editOrderDesc
    };
};
