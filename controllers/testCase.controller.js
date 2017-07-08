'use strict';

var status      = require('http-status'),
    express     = require('express'),
    handleLib   = require('../libraries/handle.lib'),
    utilLib     = require('../libraries/util.lib'),
    versionLib  = require('../libraries/version.lib'),
    models      = require('mongoose').models,
    Contest     = models.Contest,
    Log         = models.Log;

function getProblemTestCases(req, res) {
    Contest.findOne({
        nickname: req.params.contest_nickname
    })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(!problem) {
                return Promise.reject({
                    code   : status.NOT_FOUND,
                    message: 'Problem not found.'
                });
            }

            return Promise.resolve(problem.test_cases);
        })
        .then(handleLib.handleReturn.bind(null, res, 'test_cases'))
        .catch(handleLib.handleError.bind(null, res));
}

function createTestCase(req, res) {
    var insertedTestCase;
    handleLib.handleRequired(req.body, [
        'input', 'output'
    ])
        .then(function() {
            return Contest.findOne({
                nickname: req.params.contest_nickname
            });
        })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(!problem) {
                return Promise.reject({
                    code:    status.NOT_FOUND,
                    message: 'Problem not found.'
                });
            }

            var firstVersion = {
                input:    req.body.input,
                output:   req.body.output,
                order:    problem.test_cases.length + 1,
                critical: true
            };

            var test_case = {
                v: [ firstVersion ]
            };

            problem.test_cases.push(test_case);
            return contestDoc.save();
        })
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            insertedTestCase = problem.test_cases[ problem.test_cases.length-1 ];

            var log = new Log({
                author:  req.user._id,
                contest: contestDoc._id,
                problem: problem._id,
                message: 'Caso de teste adicionada ao problema ' + problem.name + ' do contest ' + contestDoc.name + '.'
            });
            return log.save();
        })
        .then(function(logDoc) {
            return Promise.resolve(insertedTestCase);
        })
        .then(handleLib.handleReturn.bind(null, res, 'test_case'))
        .catch(handleLib.handleError.bind(null, res));
}

function getTestCase(req, res) {
    Contest.findOne({
        nickname: req.params.contest_nickname
    })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(!problem) {
                return Promise.reject({
                    code:    status.NOT_FOUND,
                    message: 'Problem not found.'
                });
            }

            var test_case = problem && utilLib.getItem(problem.test_cases, { _id: req.params.test_case_id });
            if(!test_case) {
                return Promise.reject({
                    code:    status.NOT_FOUND,
                    message: 'Test case not found.'
                });
            }

            return Promise.resolve(test_case);
        })
        .then(handleLib.handleReturn.bind(null, res, 'test_case'))
        .catch(handleLib.handleError.bind(null, res));
}

function removeTestCase(req, res) {
    Contest.findOne({
        nickname: req.params.contest_nickname
    })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(!problem) {
                return Promise.reject({
                    code   : status.NOT_FOUND,
                    message: 'Problem not found.'
                });
            }

            var testCaseIndex = utilLib.getItemIndex(problem.test_cases, { _id: req.params.test_case_id });
            if(testCaseIndex === null) {
                return Promise.reject({
                    code   : status.NOT_FOUND,
                    message: 'Solution not found.'
                });
            }

            problem.test_cases.forEach(function(test_case) {
                var t_lastVersion = versionLib.getLastVersion(test_case.v);
                if(t_lastVersion.order > versionLib.getLastVersion(problem.test_cases[testCaseIndex].v).order) {
                    test_case.v.push(versionLib.createNewVersion(test_case.v, {
                        critical: false,
                        order   : t_lastVersion.order - 1
                    }));
                }
            });
            problem.test_cases.splice(testCaseIndex, 1);

            return contestDoc.save();
        })
        .then(handleLib.handleReturn.bind(null, res, 'contest'))
        .catch(handleLib.handleError.bind(null, res));
}

function editTestCase(req, res) {
    var editedTestCase;
    Contest.findOne({
        nickname: req.params.contest_nickname
    })
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(!problem) {
                return Promise.reject({
                    code:    status.NOT_FOUND,
                    message: 'Problem not found.'
                });
            }

            var testCaseIndex = utilLib.getItemIndex(problem.test_cases, { _id: req.params.test_case_id });
            if(testCaseIndex === null) {
                return Promise.reject({
                    code:    status.NOT_FOUND,
                    message: 'Test case not found.'
                });
            }

            var newVersion = versionLib.createNewVersion(problem.test_cases[testCaseIndex].v);
            var critical = false;

            if((!req.body.input  || req.body.input == newVersion.input)
            && (!req.body.output || req.body.output == newVersion.output)) {
                return Promise.reject({
                    code:    status.BAD_REQUEST,
                    message: 'No fields to be changed.'
                });
            }

            // input
            if(req.body.input !== undefined && req.body.input != newVersion.input) {
                newVersion.input = req.body.input;
                critical = true;
            }

            // output
            if(req.body.output !== undefined && req.body.output != newVersion.output) {
                newVersion.output = req.body.output;
                critical = true;
            }

            // order
            if(req.body.order !== undefined && req.body.order != newVersion.order) {
                problem.test_cases.forEach(function(tc, index) {
                    var tc_lastVersion = versionLib.getLastVersion(tc.v);

                    if(index != testCaseIndex
                    && versionLib.isBetween(tc_lastVersion.order, newVersion.order, req.body.order)) {
                        tc.v.push(versionLib.createNewVersion(tc.v, {
                            critical: false,
                            order:    tc_lastVersion.order + (newVersion.order > req.body.order ? 1 : -1)
                        }));
                    }
                });

                newVersion.order = req.body.order;
            }

            newVersion.critical = critical;
            problem.test_cases[testCaseIndex].v.push(newVersion);
            return contestDoc.save();
        })
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            editedTestCase = utilLib.getItem(problem.test_cases, { _id: req.params.test_case_id });

            var log = new Log({
                author:  req.user._id,
                contest: contestDoc._id,
                problem: problem._id,
                message: 'Caso de teste editado.'
            });
            return log.save();
        })
        .then(function(logDoc) {
            return Promise.resolve(editedTestCase);
        })
        .then(handleLib.handleReturn.bind(null, res, 'test_case'))
        .catch(handleLib.handleError.bind(null, res));
};

var router = express.Router();

router.route('/contest/:contest_nickname/problem/:problem_nickname/test_case')
    .get(getProblemTestCases)
    .post(createTestCase);

router.route('/contest/:contest_nickname/problem/:problem_nickname/test_case/:test_case_id')
    .get(getTestCase)
    .delete(removeTestCase)
    .put(editTestCase);

module.exports = router;
