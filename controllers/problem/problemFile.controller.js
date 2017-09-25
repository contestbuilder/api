'use strict';

var status    = require('http-status'),
    express   = require('express'),
    handleLib = require('../../libraries/handle.lib'),
    utilLib   = require('../../libraries/util.lib'),
    fileLib   = require('../../libraries/file.lib'),
    models    = require('mongoose').models,
    Contest   = models.Contest;


function getSignedDownloadUrl(req, res) {
    Contest.findOne({
        nickname: req.params.nickname
    })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(problem === null) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Problem not found.'
                });
            }

            if(!problem.file) {
                return Promise.reject({
                    status_code: status.BAD_REQUEST,
                    message:     'Problem doesn\'t have a file attached.'
                });
            }

            return fileLib.getSignedDownloadUrl('problemDescription', {
                contest_nickname: contestDoc.nickname,
                problem_nickname: problem.nickname,
                file_name:        problem.file.name
            });
        })
        .then(handleLib.handleReturn.bind(null, res, 'signedUrl'))
        .catch(handleLib.handleError.bind(null, res));
}

function getSignedUploadUrl(req, res) {
    Contest.findOne({
        nickname: req.params.nickname
    })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            var problem = utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
            if(problem === null) {
                return Promise.reject({
                    status_code: status.NOT_FOUND,
                    message:     'Problem not found.'
                });
            }

            return fileLib.getSignedUploadUrl('problemDescription', {
                contest_nickname: contestDoc.nickname,
                problem_nickname: problem.nickname,
                file_name:        req.body.name
            });
        })
        .then(handleLib.handleReturn.bind(null, res, 'signedUrl'))
        .catch(handleLib.handleError.bind(null, res));
}

function uploadFile(req, res) {
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

            contestDoc.problems[problemIndex].file = {
                name: req.body.name
            };

            return contestDoc.save();
        })
        .then(function(contestDoc) {
            return utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
        })
        .then(handleLib.handleReturn.bind(null, res, 'problem'))
        .catch(handleLib.handleError.bind(null, res));
}

function removeFile(req, res) {
    var localContestDoc, localProblem;
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

            var problem = contestDoc.problems[problemIndex];
            if(!problem.file) {
                return Promise.reject({
                    status_code: status.BAD_REQUEST,
                    message:     'There was no file to be deleted.'
                });
            }

            localContestDoc = contestDoc;
            localProblem = problem;

            return fileLib.removeFile('problemDescription', {
                contest_nickname: contestDoc.nickname,
                problem_nickname: problem.nickname,
                file_name:        problem.file.name
            });
        })
        .then(function() {
            localProblem.file = undefined;

            return localContestDoc.save();
        })
        .then(function(contestDoc) {
            return utilLib.getItem(contestDoc.problems, { nickname: req.params.problem_nickname });
        })
        .then(handleLib.handleReturn.bind(null, res, 'problem'))
        .catch(handleLib.handleError.bind(null, res));
}


var router = express.Router();

router.route('/contest/:nickname/problem/:problem_nickname/file')
    .get(getSignedDownloadUrl)
    .post(getSignedUploadUrl)
    .put(uploadFile)
    .delete(removeFile);

module.exports = router;
