'use strict';

var status        = require('http-status'),
    express       = require('express'),
    handleLib     = require('../../libraries/handle.lib'),
    utilLib       = require('../../libraries/util.lib'),
    versionLib    = require('../../libraries/version.lib'),
    fileLib       = require('../../libraries/file.lib'),
    aws           = require('../../libraries/aws.lib'),
    contestPolicy = require('../../policies/contest.policy'),
    contestAgg    = require('../../aggregations/contest.aggregation'),
    models        = require('mongoose').models,
    Contest       = models.Contest,
    Log           = models.Log,
    ObjectId      = require('mongoose').Types.ObjectId;


function getProblemTestCases(req, res) {
    // check if the user has permission to see this contest info.
    var contestMatch = contestPolicy.isContributor(null, req.user._id);
    contestPolicy.hideDeletedContests(contestMatch, req.user.permissions);
    contestPolicy.matchNickname(contestMatch, req.params.contest_nickname);

    // filter the problem.
    var problemMatch = {
        'problems.nickname': req.params.problem_nickname
    };

    var aggregation = contestAgg.filterOnlyLastVersions(contestMatch, problemMatch);
    utilLib.aggregate(Contest, aggregation)
        .then(handleLib.handleAggregationFindOne)
        .then(function(contestDoc) {
            if(contestDoc.problems.length !== 1) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Problem not found.'
                });
            }

            return contestDoc.problems[0].test_cases;
        })
        .then(handleLib.handleReturn.bind(null, res, 'test_cases'))
        .catch(handleLib.handleError.bind(null, res));
}

function createTestCase(req, res) {
    var input, output;

    // check if the required fields were provided.
    handleLib.handleRequired(req.body, [
        [ 'input',  'input_file_name'  ],
        [ 'output', 'output_file_name' ]
    ])
        .then(function() {
            // check if the user has permission to see this contest info.
            var contestMatch = contestPolicy.isContributor(null, req.user._id);
            contestPolicy.hideDeletedContests(contestMatch, req.user.permissions);
            contestPolicy.matchNickname(contestMatch, req.params.contest_nickname);

            return Contest.findOne(contestMatch);
        })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            // handle the input.
            if(req.body.input) {
                input = req.body.input;

                return contestDoc;
            } else if(req.body.input_file_name) {
                return new Promise(function(resolve, reject) {
                    aws.s3downloadFile(
                        fileLib.replacePathWithParams('testCaseTempFile', {
                            contest_nickname: req.params.contest_nickname,
                            problem_nickname: req.params.problem_nickname,
                            file_name:        req.body.input_file_name
                        })
                    )
                    .then(function(fileData) {
                        input = fileData.Body;

                        return resolve(contestDoc);
                    });
                });
            }
        })
        .then(function(contestDoc) {
            // handle the output.
            if(req.body.output) {
                output = req.body.output;

                return contestDoc;
            } else if(req.body.output_file_name) {
                return new Promise(function(resolve, reject) {
                    aws.s3downloadFile(
                        fileLib.replacePathWithParams('testCaseTempFile', {
                            contest_nickname: req.params.contest_nickname,
                            problem_nickname: req.params.problem_nickname,
                            file_name:        req.body.output_file_name
                        })
                    )
                    .then(function(fileData) {
                        output = fileData.Body;

                        return resolve(contestDoc);
                    });
                });
            }
        })
        .then(function(contestDoc) {
            // filter the problem.
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(!problem) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Problem not found.'
                });
            }

            var firstVersion = {
                input:            input,
                output:           output,
                input_file_name:  req.body.input_file_name,
                output_file_name: req.body.output_file_name,
                order:            problem.test_cases.length + 1,
                critical:         true
            };

            var test_case = {
                v: [ firstVersion ]
            };

            problem.test_cases.push(test_case);
            return contestDoc.save();
        })
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            return problem.test_cases[ problem.test_cases.length-1 ];
        })
        .then(handleLib.handleReturn.bind(null, res, 'test_case'))
        .catch(handleLib.handleError.bind(null, res));
}

function getTestCase(req, res) {
    // check if the user has permission to see this contest info.
    var contestMatch = contestPolicy.isContributor(null, req.user._id);
    contestPolicy.hideDeletedContests(contestMatch, req.user.permissions);
    contestPolicy.matchNickname(contestMatch, req.params.contest_nickname);

    // filter the problem.
    var problemMatch = {
        'problems.nickname': req.params.problem_nickname
    };

    // filter the test case.
    var testCaseMatch = {
        'problems.test_cases._id': ObjectId(req.params.test_case_id)
    };

    var aggregation = contestAgg.filterOnlyLastVersions(contestMatch, problemMatch, null, testCaseMatch, null, {
        show_test_case_input:  req.query.complete_input === 'true',
        show_test_case_output: req.query.complete_output === 'true'
    });
    utilLib.aggregate(Contest, aggregation)
        .then(handleLib.handleAggregationFindOne)
        .then(function(contestDoc) {
            if(contestDoc.problems.length !== 1) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Problem not found.'
                });
            }
            if(contestDoc.problems[0].test_cases.length !== 1) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Test case not found.'
                });
            }

            return contestDoc.problems[0].test_cases[0];
        })
        .then(handleLib.handleReturn.bind(null, res, 'test_case'))
        .catch(handleLib.handleError.bind(null, res));
}

function removeTestCase(req, res) {
    // check if the user has permission to see this contest info.
    var contestMatch = contestPolicy.isContributor(null, req.user._id);
    contestPolicy.hideDeletedContests(contestMatch, req.user.permissions);
    contestPolicy.matchNickname(contestMatch, req.params.contest_nickname);

    var testCaseFiles;
    Contest.findOne(contestMatch)
        .select('+problems.test_cases.v.input +problems.test_cases.v.output')
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(!problem) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Problem not found.'
                });
            }

            var testCaseIndex = utilLib.getItemIndex(problem.test_cases, { _id: req.params.test_case_id });
            if(testCaseIndex === null) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Test case not found.'
                });
            }

            // in case the files are on s3, save the reference to delete it.
            testCaseFiles = {
                input_file_name:  problem.test_cases[testCaseIndex].input_file_name,
                output_file_name: problem.test_cases[testCaseIndex].output_file_name
            };

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
        .then(function(contestDoc) {
            // remove input file from s3.
            if(testCaseFiles.input_file_name) {
                return aws.s3removeFile(
                    fileLib.replacePathWithParams('testCaseTempFile', {
                        contest_nickname: contestDoc.nickname,
                        problem_nickname: req.params.problem_nickname,
                        file_name:        testCaseFiles.input_file_name
                    })
                ).then(function(data) {
                    return contestDoc;
                });
            }

            return contestDoc;
        })
        .then(function(contestDoc) {
            // remove output file from s3.
            if(testCaseFiles.output_file_name) {
                return aws.s3removeFile(
                    fileLib.replacePathWithParams('testCaseTempFile', {
                        contest_nickname: contestDoc.nickname,
                        problem_nickname: req.params.problem_nickname,
                        file_name:        testCaseFiles.output_file_name
                    })
                ).then(function(data) {
                    return contestDoc;
                });
            }

            return contestDoc;
        })
        .then(function(contestDoc) {
            return true;
        })
        .then(handleLib.handleReturn.bind(null, res, 'success'))
        .catch(handleLib.handleError.bind(null, res));
}

function editTestCase(req, res) {
    // check if the user has permission to see this contest info.
    var contestMatch = contestPolicy.isContributor(null, req.user._id);
    contestPolicy.hideDeletedContests(contestMatch, req.user.permissions);
    contestPolicy.matchNickname(contestMatch, req.params.contest_nickname);

    var testCase, testCaseNewVersion;
    var input, output;
    Contest.findOne(contestMatch)
        .select('+problems.test_cases.v.input +problems.test_cases.v.output')
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(!problem) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Problem not found.'
                });
            }

            var testCaseIndex = utilLib.getItemIndex(problem.test_cases, { _id: req.params.test_case_id });
            if(testCaseIndex === null) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Test case not found.'
                });
            }

            testCase = problem.test_cases[testCaseIndex];
            testCaseNewVersion = versionLib.createNewVersion(testCase.v);

            // order
            if(req.body.order !== undefined && req.body.order != testCaseNewVersion.order) {
                problem.test_cases.forEach(function(tc, index) {
                    var tc_lastVersion = versionLib.getLastVersion(tc.v);

                    if(index != testCaseIndex
                    && versionLib.isBetween(tc_lastVersion.order, testCaseNewVersion.order, req.body.order)) {
                        tc.v.push(versionLib.createNewVersion(tc.v, {
                            critical: false,
                            order:    tc_lastVersion.order + (testCaseNewVersion.order > req.body.order ? 1 : -1)
                        }));
                    }
                });

                testCaseNewVersion.order = req.body.order;
            }

            return contestDoc;
        })
        .then(function(contestDoc) {
            // update input
            if(req.body.input !== undefined && req.body.input !== testCaseNewVersion.input) {
                testCaseNewVersion.input = req.body.input;
            }

            if(req.body.input_file_name !== testCaseNewVersion.input_file_name) {
                return Promise.resolve(contestDoc)
                .then(function(contestDoc) {
                    // remove old file, if there was one.
                    if(!!testCaseNewVersion.input_file_name) {
                        return aws.s3removeFile(
                            fileLib.replacePathWithParams('testCaseTempFile', {
                                contest_nickname: contestDoc.nickname,
                                problem_nickname: req.params.problem_nickname,
                                file_name:        testCaseNewVersion.input_file_name
                            })
                        )
                        .then(function(result) {
                            testCaseNewVersion.input_file_name = undefined;

                            return contestDoc;
                        });
                    }

                    return contestDoc;
                })
                .then(function(contestDoc) {
                    // load new file on the object.
                    if(req.body.input_file_name) {
                        return aws.s3downloadFile(
                            fileLib.replacePathWithParams('testCaseTempFile', {
                                contest_nickname: contestDoc.nickname,
                                problem_nickname: req.params.problem_nickname,
                                file_name:        req.body.input_file_name
                            })
                        )
                        .then(function(fileData) {
                            testCaseNewVersion.input = fileData.Body;
                            testCaseNewVersion.input_file_name = req.body.input_file_name;

                            return contestDoc;
                        });
                    }

                    return contestDoc;
                });
            }

            return contestDoc;
        })
        .then(function(contestDoc) {
            // update output
            if(req.body.output !== undefined && req.body.output !== testCaseNewVersion.output) {
                testCaseNewVersion.output = req.body.output;
            }

            if(req.body.output_file_name !== testCaseNewVersion.output_file_name) {
                return Promise.resolve(contestDoc)
                .then(function(contestDoc) {
                    // remove old file, if there was one.
                    if(!!testCaseNewVersion.output_file_name) {
                        return aws.s3removeFile(
                            fileLib.replacePathWithParams('testCaseTempFile', {
                                contest_nickname: contestDoc.nickname,
                                problem_nickname: req.params.problem_nickname,
                                file_name:        testCaseNewVersion.output_file_name
                            })
                        )
                        .then(function(result) {
                            testCaseNewVersion.output_file_name = undefined;

                            return contestDoc;
                        });
                    }

                    return contestDoc;
                })
                .then(function(contestDoc) {
                    // load new file on the object.
                    if(req.body.output_file_name) {
                        return aws.s3downloadFile(
                            fileLib.replacePathWithParams('testCaseTempFile', {
                                contest_nickname: contestDoc.nickname,
                                problem_nickname: req.params.problem_nickname,
                                file_name:        req.body.output_file_name
                            })
                        )
                        .then(function(fileData) {
                            testCaseNewVersion.output = fileData.Body;
                            testCaseNewVersion.output_file_name = req.body.output_file_name;

                            return contestDoc;
                        });
                    }

                    return contestDoc;
                });
            }

            return contestDoc;
        })
        .then(function(contestDoc) {
            testCase.v.push(testCaseNewVersion);

            return contestDoc.save();
        })
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            return utilLib.getItem(problem.test_cases, { _id: req.params.test_case_id });
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
