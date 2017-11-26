'use strict';

var express    = require('express'),
    handleLib  = require('../libraries/handle.lib'),
    versionLib = require('../libraries/version.lib'),
    runLib     = require('../libraries/run.lib'),
    utilLib    = require('../libraries/util.lib'),
    problemLib = require('../libraries/problem.lib'),
    mongoose   = require('mongoose'),
    models     = mongoose.models,
    Contest    = models.Contest,
    Log        = models.Log;

/**
 * Controllers
 */
function runSolutions(req, res) {
    var localContestDoc;
    var localProblemDoc;
    var localResults;
    var lastRunNumber;
    handleLib.handleRequired(req.body, [
        'solutions', 'test_cases'
    ])
        .then(function() {
            return Contest.findOne({
                nickname: req.params.contest_nickname
            })
            .select('+problems.test_cases.v.input +problems.test_cases.v.output');
        })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            localContestDoc = contestDoc;
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(!problem) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Problem not found.'
                });
            }
            var p_lastVersion = versionLib.getLastVersion(problem.v);
            lastRunNumber = problemLib.getLastRunNumber(problem.solutions);

            var solutions = problem.solutions.filter(function(solution) {
                return req.body.solutions.some(function(solution_param) {
                    return !solution.deleted_at && solution_param == solution.nickname;
                });
            });
            if(!solutions || !solutions.length) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Solutions not found.'
                });
            }

            var test_cases = problem.test_cases.filter(function(test_case) {
                return req.body.test_cases.some(function(test_case_param) {
                    return !test_case.deleted_at && test_case_param == test_case._id;
                });
            });
            if(!test_cases || !test_cases.length) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Test cases not found.'
                });
            }

            var promises = [];
            solutions.forEach(function(solution) {
                var s_lastVersion = versionLib.getLastVersion(solution.v);

                test_cases.forEach(function(test_case) {
                    var t_lastVersion = versionLib.getLastVersion(test_case.v);

                    promises.push(runLib.run(
                        s_lastVersion.source_code,
                        s_lastVersion.language,
                        p_lastVersion.time_limit,
                        t_lastVersion.input,
                        t_lastVersion.output,
                        {
                            solution:  solution,
                            test_case: test_case
                        }
                    ));
                });
            });

            return Promise.all(promises);
        })
        .then(function(results) {
            var run_id = new mongoose.mongo.ObjectId();

            localResults = {
                results:    results,
                run_id:     run_id,
                run_number: lastRunNumber + 1
            };
            results.forEach(function(result) {
                var problem   = utilLib.getItem(localContestDoc.problems, { nickname: req.params.problem_nickname });
                var solution  = utilLib.getItem(problem.solutions, { _id: result.context.solution._id });
                var test_case = utilLib.getItem(problem.test_cases, { _id: result.context.test_case._id });

                solution.run.push({
                    _id:          result._id,
                    run_id:       run_id,
                    run_number:   lastRunNumber + 1,
                    test_case_id: test_case._id,
                    success:      result.success,
                    output:       result.success ? result.output : result.err,
                    duration:     result.duration || 0,
                    verdict:      result.verdict
                });

                delete result.context;
            });

            return localContestDoc.save();
        })
        .then(function(contestDoc) {
            return Promise.resolve(localResults);
        })
        .then(handleLib.handleReturn.bind(null, res, 'results'))
        .catch(handleLib.handleError.bind(null, res));
};

function runCheckers(req, res) {
    var localContestDoc;
    var localProblemDoc;
    var localResults;
    var lastRunNumber;
    handleLib.handleRequired(req.body, [
        'checkers', 'test_cases'
    ])
        .then(function() {
            return Contest.findOne({
                nickname: req.params.contest_nickname
            })
            .select('+problems.test_cases.v.input +problems.test_cases.v.output');
        })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            localContestDoc = contestDoc;
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(!problem) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Problem not found.'
                });
            }
            var p_lastVersion = versionLib.getLastVersion(problem.v);
            lastRunNumber = problemLib.getLastRunNumber(problem.checkers);

            var checkers = problem.checkers.filter(function(checker) {
                return req.body.checkers.some(function(checker_param) {
                    return !checker.deleted_at && checker_param == checker.nickname;
                });
            });
            if(!checkers || !checkers.length) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Checker not found.'
                });
            }

            var test_cases = problem.test_cases.filter(function(test_case) {
                return req.body.test_cases.some(function(test_case_param) {
                    return !test_case.deleted_at && test_case_param == test_case._id;
                });
            });
            if(!test_cases || !test_cases.length) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Test cases not found.'
                });
            }

            var promises = [];
            checkers.forEach(function(checker) {
                var c_lastVersion = versionLib.getLastVersion(checker.v);

                test_cases.forEach(function(test_case) {
                    var t_lastVersion = versionLib.getLastVersion(test_case.v);

                    promises.push(runLib.run(
                        c_lastVersion.source_code,
                        c_lastVersion.language,
                        5,
                        t_lastVersion.input,
                        'ok\n',
                        {
                            checker:   checker,
                            test_case: test_case
                        }
                    ));
                });
            });

            return Promise.all(promises);
        })
        .then(function(results) {
            var run_id = new mongoose.mongo.ObjectId();

            localResults = {
                results:    results,
                run_id:     run_id,
                run_number: lastRunNumber + 1
            };
            results.forEach(function(result) {
                var problem   = utilLib.getItem(localContestDoc.problems, { nickname: req.params.problem_nickname });
                var checker   = utilLib.getItem(problem.checkers, { _id: result.context.checker._id });
                var test_case = utilLib.getItem(problem.test_cases, { _id: result.context.test_case._id });

                checker.run.push({
                    _id:          result._id,
                    run_id:       run_id,
                    run_number:   lastRunNumber + 1,
                    test_case_id: test_case._id,
                    success:      result.success,
                    output:       result.success ? result.output : result.err,
                    duration:     result.duration || 0,
                    verdict:      result.verdict
                });

                delete result.context;
            });

            return localContestDoc.save();
        })
        .then(function(contestDoc) {
            return Promise.resolve(localResults);
        })
        .then(handleLib.handleReturn.bind(null, res, 'results'))
        .catch(handleLib.handleError.bind(null, res));
};

/**
 * Routes
 */

var router = express.Router();

router.route('/contest/:contest_nickname/problem/:problem_nickname/run/solutions')
    .post(runSolutions);

router.route('/contest/:contest_nickname/problem/:problem_nickname/run/checkers')
    .post(runCheckers);

module.exports = router;
