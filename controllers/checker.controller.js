'use strict';

var status      = require('http-status'),
    express     = require('express'),
    handleLib   = require('../libraries/handle.lib'),
    utilLib     = require('../libraries/util.lib'),
    versionLib  = require('../libraries/version.lib'),
    models      = require('mongoose').models,
    Contest     = models.Contest,
    Log         = models.Log;

function getProblemCheckers(req, res) {
    Contest.findOne({
        nickname: req.params.contest_nickname
    })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(!problem) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Problem not found.'
                });
            }

            return Promise.resolve(problem.checkers);
        })
        .then(handleLib.handleReturn.bind(null, res, 'checkers'))
        .catch(handleLib.handleError.bind(null, res));
}

function createChecker(req, res) {
    var insertedChecker;
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
                    status_code: status.NOT_FOUND,
                    message:     'Problem not found.'
                });
            }

            var firstVersion = {
                source_code: req.body.source_code,
                language:    req.body.language,
                order:       problem.checkers.length + 1,
                critical:    true
            };

            var checker = {
                name: req.body.name,
                v   : [ firstVersion ]
            };

            problem.checkers.push(checker);
            return contestDoc.save();
        })
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            insertedChecker = utilLib.getItem(problem.checkers, { name: req.body.name });

            var log = new Log({
                author:  req.user._id,
                contest: contestDoc._id,
                problem: problem._id,
                message: 'Checker ' + insertedChecker.name + ' adicionado ao problema ' + problem.name + ' do contest ' + contestDoc.name + '.'
            });
            return log.save();
        })
        .then(function(logDoc) {
            return Promise.resolve(insertedChecker);
        })
        .then(handleLib.handleReturn.bind(null, res, 'checker'))
        .catch(handleLib.handleError.bind(null, res));
}

function getChecker(req, res) {
    Contest.findOne({
        nickname: req.params.contest_nickname
    })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(!problem) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Problem not found.'
                });
            }

            var checker = problem && utilLib.getItem(problem.checkers, { nickname: req.params.checker_nickname });
            if(!checker) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Checker not found.'
                });
            }

            return Promise.resolve(checker);
        })
        .then(handleLib.handleReturn.bind(null, res, 'checker'))
        .catch(handleLib.handleError.bind(null, res));
}

function removeChecker(req, res) {
    Contest.findOne({
        nickname: req.params.contest_nickname
    })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(!problem) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Problem not found.'
                });
            }

            var checkerIndex = utilLib.getItemIndex(problem.checkers, { nickname: req.params.checker_nickname });
            if(checkerIndex === null) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Checker not found.'
                });
            }

            problem.checkers.forEach(function(checker) {
                var c_lastVersion = versionLib.getLastVersion(checker.v);
                if(c_lastVersion.order > versionLib.getLastVersion(problem.checkers[checkerIndex].v).order) {
                    checker.v.push(versionLib.createNewVersion(checker.v, {
                        critical: false,
                        order   : c_lastVersion.order - 1
                    }));
                }
            });
            problem.checkers.splice(checkerIndex, 1);

            return contestDoc.save();
        })
        .then(handleLib.handleReturn.bind(null, res, 'contest'))
        .catch(handleLib.handleError.bind(null, res));
}

function editChecker(req, res) {
    var editedChecker;
    Contest.findOne({
        nickname: req.params.contest_nickname
    })
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(!problem) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Problem not found.'
                });
            }

            var checkerIndex = utilLib.getItemIndex(problem.checkers, { nickname: req.params.checker_nickname });
            if(checkerIndex === null) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Checker not found.'
                });
            }

            var newVersion = versionLib.createNewVersion(problem.checkers[checkerIndex].v);
            var critical = false;

            if((!req.body.source_code || req.body.source_code == newVersion.source_code)
            && (!req.body.language    || req.body.language == newVersion.language)
            && (!req.body.order       || req.body.order == newVersion.order)) {
                return Promise.reject({
                    status_code: status.BAD_REQUEST,
                    message:     'No fields to be changed.'
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
                problem.checkers.forEach(function(c, index) {
                    var c_lastVersion = versionLib.getLastVersion(c.v);

                    if(index != checkerIndex
                    && versionLib.isBetween(c_lastVersion.order, newVersion.order, req.body.order)) {
                        c.v.push(versionLib.createNewVersion(c.v, {
                            critical: false,
                            order:    c_lastVersion.order + (newVersion.order > req.body.order ? 1 : -1)
                        }));
                    }
                });

                newVersion.order = req.body.order;
            }

            newVersion.critical = critical;
            problem.checkers[checkerIndex].v.push(newVersion);
            return contestDoc.save();
        })
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            editedChecker = utilLib.getItem(problem.checkers, { nickname: req.params.checker_nickname });

            var log = new Log({
                author:  req.user._id,
                contest: contestDoc._id,
                problem: problem._id,
                message: 'Checker ' + editedChecker.name + ' editado.'
            });
            return log.save();
        })
        .then(function(logDoc) {
            return Promise.resolve(editedChecker);
        })
        .then(handleLib.handleReturn.bind(null, res, 'checker'))
        .catch(handleLib.handleError.bind(null, res));
};

var router = express.Router();

router.route('/contest/:contest_nickname/problem/:problem_nickname/checker')
    .get(getProblemCheckers)
    .post(createChecker);

router.route('/contest/:contest_nickname/problem/:problem_nickname/checker/:checker_nickname')
    .get(getChecker)
    .delete(removeChecker)
    .put(editChecker);

module.exports = router;
