'use strict';

var status     = require('http-status'),
    express    = require('express'),
    handleLib  = require('../../libraries/handle.lib'),
    versionLib = require('../../libraries/version.lib'),
    utilLib    = require('../../libraries/util.lib'),
    models     = require('mongoose').models,
    Contest    = models.Contest,
    Problem    = models.Problem,
    Log        = models.Log;

function getContestProblems(req, res) {
    Contest.findOne({
        nickname: req.params.nickname
    })
        .populate('problems')
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            return Promise.resolve(contestDoc.problems || []);
        })
        .then(handleLib.handleReturn.bind(null, res, 'problems'))
        .catch(handleLib.handleError.bind(null, res));
}

function createProblem(req, res) {
    var insertedProblem, contest;

    handleLib.handleRequired(req.body, [
        'name', 'description'
    ])
        .then(function() {
            return Contest.findOne({
                nickname: req.params.nickname
            });
        })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            contest = contestDoc;

            var firstVersion = {
                description: req.body.description,
                time_limit:  req.body.time_limit || 1,
                order:       contestDoc.problems.length + 1,
                critical:    true
            };

            var problem = new Problem({
                name:       req.body.name,
                v:          [ firstVersion ],
                solutions:  [],
                test_cases: []
            });

            return problem.save();
        })
        .then(function(problemDoc) {
            insertedProblem = problemDoc;

            contest.problems.push(problemDoc._id);

            return contest.save();
        })
        .then(function(contestDoc) {
            return Promise.resolve(insertedProblem);
        })
        .then(handleLib.handleReturn.bind(null, res, 'problem'))
        .catch(handleLib.handleError.bind(null, res));
}

function getProblem(req, res) {
    Contest.findOne({
        nickname: req.params.nickname
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

            return Promise.resolve(problem);
        })
        .then(handleLib.handleReturn.bind(null, res, 'problem'))
        .catch(handleLib.handleError.bind(null, res));
}

function removeProblem(req, res) {
    Contest.findOne({
        nickname: req.params.nickname
    })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            var problemIndex = utilLib.getItemIndex(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(problemIndex === null) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Problem not found.'
                });
            }

            contestDoc.problems.forEach(function(p) {
                var p_lastVersion = versionLib.getLastVersion(p.v);
                if(p_lastVersion.order > versionLib.getLastVersion(contestDoc.problems[problemIndex].v).order) {
                    p.v.push(versionLib.createNewVersion(p.v, {
                        critical: false,
                        order:    p_lastVersion.order - 1
                    }));
                }
            });
            contestDoc.problems[problemIndex].deleted_at = new Date();

            return contestDoc.save();
        })
        .then(handleLib.handlePopulate.bind(null, 'author contributors'))
        .then(handleLib.handleReturn.bind(null, res, 'contest'))
        .catch(handleLib.handleError.bind(null, res));
}

function editProblem(req, res) {
    var editedProblem;
    Contest.findOne({
        nickname: req.params.nickname
    })
        .then(function(contestDoc) {
            var problemIndex = utilLib.getItemIndex(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(problemIndex === null) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Problem not found.'
                });
            }

            var newVersion = versionLib.createNewVersion(contestDoc.problems[problemIndex].v);
            var critical = false;

            if((!req.body.time_limit  || req.body.time_limit == newVersion.time_limit)
            && (!req.body.description || req.body.description == newVersion.description)
            && (!req.body.order       || req.body.order == newVersion.order)) {
                return Promise.reject({
                    status_code: status.BAD_REQUEST,
                    message:     'No fields to be changed.'
                });
            }

            // time_limit
            if(req.body.time_limit !== undefined && req.body.time_limit != newVersion.time_limit) {
                newVersion.time_limit = req.body.time_limit;
                critical = true;
            }

            // description
            if(req.body.description !== undefined && req.body.description != newVersion.description) {
                newVersion.description = req.body.description;
            }

            // order
            if(req.body.order !== undefined && req.body.order != newVersion.order) {
                contestDoc.problems.forEach(function(p, index) {
                    var p_lastVersion = versionLib.getLastVersion(p.v);

                    if(index != problemIndex
                    && versionLib.isBetween(p_lastVersion.order, newVersion.order, req.body.order)) {
                        p.v.push(versionLib.createNewVersion(p.v, {
                            critical: false,
                            order:    p_lastVersion.order + (newVersion.order > req.body.order ? 1 : -1)
                        }));
                    }
                });

                newVersion.order = req.body.order;
            }

            newVersion.critical = critical;
            contestDoc.problems[problemIndex].v.push(newVersion);
            return contestDoc.save();
        })
        .then(function(contestDoc) {
            editedProblem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });

            var log = new Log({
                author:  req.user._id,
                contest: contestDoc._id,
                problem: editedProblem._id,
                message: 'Problema ' + editedProblem.name + ' editado.'
            });
            return log.save();
        })
        .then(function(logDoc) {
            return Promise.resolve(editedProblem);
        })
        .then(handleLib.handleReturn.bind(null, res, 'problem'))
        .catch(handleLib.handleError.bind(null, res));
}


var router = express.Router();

router.route('/contest/:nickname/problem/')
    .get(getContestProblems)
    .post(createProblem);

router.route('/contest/:nickname/problem/:problem_nickname')
    .get(getProblem)
    .delete(removeProblem)
    .put(editProblem);

module.exports = router;
