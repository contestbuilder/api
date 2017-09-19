'use strict';

var express   = require('express'),
    handleLib = require('../libraries/handle.lib'),
    bocaLib   = require('../libraries/boca.lib'),
    models    = require('mongoose').models,
    Contest   = models.Contest;

/**
 * Controllers
 */

/**
 * Generate zip file on boca format.
 */
function generateBocaZip(req, res) {
    Contest.findOne({
        nickname: req.params.nickname,
        $or: [
            { author:       req.user._id },
            { contributors: req.user._id }
        ]
    })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            req.body.problems.forEach(function(reqProblem) {
                var problem = utilLib.getItem(contestDoc.problems, { nickname: reqProblem.nickname });
                if(!problem) {
                    return Promise.reject({
                        code:    status.NOT_FOUND,
                        message: 'Problem not found.'
                    });
                }
            })
        })
        .then(handleLib.handleReturn.bind(null, res, 'contest'))
        .catch(handleLib.handleError.bind(null, res));
}

/**
 * Routes
 */

var router = express.Router();

router.route('/contest/:nickname/boca')
    .post(generateBocaZip);

module.exports = router;
