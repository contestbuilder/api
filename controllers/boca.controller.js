'use strict';

var status    = require('http-status'),
    express   = require('express'),
    handleLib = require('../libraries/handle.lib'),
    bocaLib   = require('../libraries/boca.lib'),
    fileLib   = require('../libraries/file.lib'),
    s3        = require('../libraries/aws.lib').s3,
    models    = require('mongoose').models,
    Contest   = models.Contest;

/**
 * Controllers
 */

/**
 * Generate zip file on boca format.
 */
function generateBocaZip(req, res) {
    var bocaZipIndex;
    var problems;

    Contest.findOne({
        nickname: req.params.nickname,
        $or: [
            { author:       req.user._id },
            { contributors: req.user._id }
        ]
    })
        .select('+problems.test_cases.v.input +problems.test_cases.v.output')
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            problems = contestDoc.problems.filter(function(problem) {
                return req.body.problems.indexOf(problem.nickname) !== -1;
            });
            if(!problems.length) {
                return Promise.reject({
                    status_code: status.BAD_REQUEST,
                    message:     'No problems to be added.'
                });
            }

            contestDoc.bocaZip = contestDoc.bocaZip || [];
            bocaZipIndex = contestDoc.bocaZip.push({
                author: req.user._id,
                status: 'generating'
            }) - 1;

            return contestDoc.save();
        })
        .then(function(contestDoc) {
            return bocaLib.buildBocaZip(
                contestDoc.nickname,
                problems,
                'v1'
            )
            .then(function(bocaZipResult) {
                return {
                    contestDoc:    contestDoc,
                    bocaZipResult: bocaZipResult
                };
            });
        })
        .then(function(result) {
            result.contestDoc.bocaZip[bocaZipIndex].status = 'done';

            if(result.bocaZipResult.err) {
                result.contestDoc.bocaZip[bocaZipIndex].err = result.bocaZipResult.err;
            } else {
                result.contestDoc.bocaZip[bocaZipIndex].VersionId = result.bocaZipResult.VersionId;
            }

            return result.contestDoc.save();
        })
        .then(function(contestDoc) {
            return contestDoc.bocaZip[bocaZipIndex];
        })
        .then(handleLib.handleReturn.bind(null, res, 'bocaZip'))
        .catch(handleLib.handleError.bind(null, res));
}

function downloadZip(req, res) {
    Contest.findOne({
        nickname: req.params.nickname,
        $or: [
            { author:       req.user._id },
            { contributors: req.user._id }
        ]
    })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            if(!contestDoc.bocaZip || !contestDoc.bocaZip.length) {
                return Promise.reject({
                    status_code: status.BAD_REQUEST,
                    message:     'No boca files do download.'
                });
            }

            var versionId = undefined;
            if(req.query.VersionId && contestDoc.bocaZip.some(function(bocaZip) {
                return bocaZip.VersionId === req.query.VersionId;
            })) {
                versionId = req.query.VersionId;
            }


            return fileLib.getSignedDownloadUrl('bocaZip', {
                contest_nickname: contestDoc.nickname
            }, {
                VersionId: versionId
            });
        })
        .then(handleLib.handleReturn.bind(null, res, 'signedUrl'))
        .catch(handleLib.handleError.bind(null, res));
}

/**
 * Routes
 */

var router = express.Router();

router.route('/contest/:nickname/boca')
    .post(generateBocaZip);

router.route('/contest/:nickname/boca/download')
    .get(downloadZip);

module.exports = router;
