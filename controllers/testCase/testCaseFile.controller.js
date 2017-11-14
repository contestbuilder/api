'use strict';

var express       = require('express'),
    status        = require('http-status'),
    handleLib     = require('../../libraries/handle.lib'),
    utilLib       = require('../../libraries/util.lib'),
    fileLib       = require('../../libraries/file.lib'),
    contestPolicy = require('../../policies/contest.policy'),
    contestAgg    = require('../../aggregations/contest.aggregation'),
    mongoose      = require('mongoose'),
    ObjectId      = mongoose.Types.ObjectId,
    models        = mongoose.models,
    Contest       = models.Contest;


function getSignedUploadUrl(req, res) {
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

            // generate a random file name.
        	var fileName = (new ObjectId()).toString() + '.txt';

            var signedUrl = fileLib.getSignedUploadUrl('testCaseTempFile', {
                contest_nickname: contestDoc.nickname,
                problem_nickname: contestDoc.problems[0].nickname,
                file_name:        fileName
            });
            signedUrl.file_name = fileName;

            return signedUrl;
        })
        .then(handleLib.handleReturn.bind(null, res, 'signedUrl'))
        .catch(handleLib.handleError.bind(null, res));
}

function getSignedDownloadUrl(req, res) {
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

            return fileLib.getSignedDownloadUrl('testCaseTempFile', {
                contest_nickname: contestDoc.nickname,
                problem_nickname: contestDoc.problems[0].nickname,
                file_name:        req.params.file_name
            });
        })
        .then(handleLib.handleReturn.bind(null, res, 'signedUrl'))
        .catch(handleLib.handleError.bind(null, res));
}

function removeFile(req, res) {
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

            return fileLib.removeFile('testCaseTempFile', {
                contest_nickname: contestDoc.nickname,
                problem_nickname: req.params.problem_nickname,
                file_name:        req.params.file_name
            });
        })
        .then(function(result) {
            return true;
        })
        .then(handleLib.handleReturn.bind(null, res, 'success'))
        .catch(handleLib.handleError.bind(null, res));
}


var router = express.Router();

router.route('/contest/:contest_nickname/problem/:problem_nickname/test_case/file')
    .post(getSignedUploadUrl);

router.route('/contest/:contest_nickname/problem/:problem_nickname/test_case/file/:file_name')
    .get(getSignedDownloadUrl)
    .delete(removeFile);

module.exports = router;
