'use strict';

var status      = require('http-status'),
    express     = require('express'),
    handleLib   = require('../libraries/handle.lib'),
    utilLib     = require('../libraries/util.lib'),
    versionLib  = require('../libraries/version.lib'),
    models      = require('mongoose').models,
    Contest     = models.Contest,
    Log         = models.Log;

function getProblemSolutions(req, res) {
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

            return Promise.resolve(problem.solutions);
        })
        .then(handleLib.handleReturn.bind(null, res, 'solutions'))
        .catch(handleLib.handleError.bind(null, res));
}

function createSolution(req, res) {
    var insertedSolution;
    handleLib.handleRequired(req.body, [
        'name', 'source_code'
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
                    code   : status.NOT_FOUND,
                    message: 'Problem not found.'
                });
            }

            var firstVersion = {
                source_code     : req.body.source_code,
                language        : req.body.language,
                expected_verdict: req.body.expected_verdict,
                order           : problem.solutions.length + 1,
                critical        : true
            };

            var solution = {
                name: req.body.name,
                v   : [ firstVersion ]
            };

            problem.solutions.push(solution);
            return contestDoc.save();
        })
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            insertedSolution = utilLib.getItem(problem.solutions, { name: req.body.name });

            var log = new Log({
                author : req.user._id,
                contest: contestDoc._id,
                problem: problem._id,
                message: 'Solução ' + insertedSolution.name + ' adicionada ao problema ' + problem.name + ' do contest ' + contestDoc.name + '.'
            });
            return log.save();
        })
        .then(function(logDoc) {
            return Promise.resolve(insertedSolution);
        })
        .then(handleLib.handleReturn.bind(null, res, 'solution'))
        .catch(handleLib.handleError.bind(null, res));
}

function getSolution(req, res) {
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

            var solution = problem && utilLib.getItem(problem.solutions, { nickname: req.params.solution_nickname });
            if(!solution) {
                return Promise.reject({
                    code   : status.NOT_FOUND,
                    message: 'Solution not found.'
                });
            }

            return Promise.resolve(solution);
        })
        .then(handleLib.handleReturn.bind(null, res, 'solution'))
        .catch(handleLib.handleError.bind(null, res));
}

function removeSolution(req, res) {
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

            var solutionIndex = utilLib.getItemIndex(problem.solutions, { nickname: req.params.solution_nickname });
            if(solutionIndex === null) {
                return Promise.reject({
                    code   : status.NOT_FOUND,
                    message: 'Solution not found.'
                });
            }

            problem.solutions.forEach(function(solution) {
                var s_lastVersion = versionLib.getLastVersion(solution.v);
                if(s_lastVersion.order > versionLib.getLastVersion(problem.solutions[solutionIndex].v).order) {
                    solution.v.push(versionLib.createNewVersion(solution.v, {
                        critical: false,
                        order   : s_lastVersion.order - 1
                    }));
                }
            });
            problem.solutions.splice(solutionIndex, 1);

            return contestDoc.save();
        })
        .then(handleLib.handleReturn.bind(null, res, 'contest'))
        .catch(handleLib.handleError.bind(null, res));
}

function editSolution(req, res) {
    var editedSolution;
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

            var solutionIndex = utilLib.getItemIndex(problem.solutions, { nickname: req.params.solution_nickname });
            if(solutionIndex === null) {
                return Promise.reject({
                    code:    status.NOT_FOUND,
                    message: 'Solution not found.'
                });
            }

            var newVersion = versionLib.createNewVersion(problem.solutions[solutionIndex].v);
            var critical = false;

            if((!req.body.source_code || req.body.source_code == newVersion.source_code)
            && (!req.body.language    || req.body.language == newVersion.language)
            && (!req.body.order       || req.body.order == newVersion.order)) {
                return Promise.reject({
                    code:    status.BAD_REQUEST,
                    message: 'No fields to be changed.'
                });
            }

            // source_code
            if(req.body.source_code !== undefined && req.body.source_code != newVersion.source_code) {
                newVersion.source_code = req.body.source_code;
                critical = true;
            }

            // language
            if(req.body.language !== undefined && req.body.language != newVersion.language) {
                newVersion.language = req.body.language;
                critical = true;
            }

            // order
            if(req.body.order !== undefined && req.body.order != newVersion.order) {
                problem.solutions.forEach(function(s, index) {
                    var s_lastVersion = versionLib.getLastVersion(s.v);

                    if(index != solutionIndex
                    && versionLib.isBetween(s_lastVersion.order, newVersion.order, req.body.order)) {
                        s.v.push(versionLib.createNewVersion(s.v, {
                            critical: false,
                            order:    s_lastVersion.order + (newVersion.order > req.body.order ? 1 : -1)
                        }));
                    }
                });

                newVersion.order = req.body.order;
            }

            newVersion.critical = critical;
            problem.solutions[solutionIndex].v.push(newVersion);
            return contestDoc.save();
        })
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            editedSolution = utilLib.getItem(problem.solutions, { nickname: req.params.solution_nickname });

            var log = new Log({
                author:  req.user._id,
                contest: contestDoc._id,
                problem: problem._id,
                message: 'Solução ' + editedSolution.name + ' editada.'
            });
            return log.save();
        })
        .then(function(logDoc) {
            return Promise.resolve(editedSolution);
        })
        .then(handleLib.handleReturn.bind(null, res, 'solution'))
        .catch(handleLib.handleError.bind(null, res));
};

var router = express.Router();

router.route('/contest/:contest_nickname/problem/:problem_nickname/solution')
    .get(getProblemSolutions)
    .post(createSolution);

router.route('/contest/:contest_nickname/problem/:problem_nickname/solution/:solution_nickname')
    .get(getSolution)
    .delete(removeSolution)
    .put(editSolution);

module.exports = router;
