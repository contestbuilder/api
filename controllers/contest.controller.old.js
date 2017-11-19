'use strict';

var express       = require('express'),
    handleLib     = require('../libraries/handle.lib'),
    utilLib       = require('../libraries/util.lib'),
    contestAgg    = require('../aggregations/contest.aggregation'),
    contestPolicy = require('../policies/contest.policy'),
    models        = require('mongoose').models,
    Contest       = models.Contest;

/**
 * Controllers
 */

/**
 * Get all the contests.
 */
function getAllContests(req, res) {
    // filter the contests that the user has permission to see.
    var contestMatch = contestPolicy.isContributor(null, req.user._id);
    // show/hide deleted contests.
    if(req.query.show_deleted === 'true') {
        contestPolicy.hideDeletedContests(contestMatch, req.user.permissions);
    } else {
        contestPolicy.hideDeletedContests(contestMatch);
    }

    var aggregation = contestAgg.filterOnlyLastVersions(contestMatch);
    aggregation = aggregation.concat(contestAgg.populateAuthorAndContributors);

    utilLib.aggregate(Contest, aggregation)
        .then(handleLib.handleReturn.bind(null, res, 'contests'))
        .catch(handleLib.handleError.bind(null, res));
}

/**
 * Create a contest.
 */
function createContest(req, res) {
    handleLib.handleRequired(req.body, [
        'name'
    ])
        .then(function() {
            var contest = new Contest({
                author:       req.user._id,
                name:         req.body.name,
                contributors: [ req.user._id ],
                scheduled_to: req.body.scheduled_to,
                problems:     []
            });

            return contest.save();
        })
        .then(handleLib.handleReturn.bind(null, res, 'contest'))
        .catch(handleLib.handleError.bind(null, res));
}


/**
 * Get a specific contest.
 */
function getContest(req, res) {
    // check if the user has permission to see this contest info.
    var contestMatch = contestPolicy.isContributor(null, req.user._id);
    contestPolicy.hideDeletedContests(contestMatch, req.user.permissions);
    contestPolicy.matchNickname(contestMatch, req.params.nickname);

    var aggregation = contestAgg.filterOnlyLastVersions(contestMatch);
    aggregation = aggregation.concat(contestAgg.populateAuthorAndContributors);

    utilLib.aggregate(Contest, aggregation)
        .then(handleLib.handleAggregationFindOne)
        .then(handleLib.handleReturn.bind(null, res, 'contest'))
        .catch(handleLib.handleError.bind(null, res));
}


/**
 * Edit a contest.
 */
function editContest(req, res) {
    // check if the user has permission to see this contest info.
    var contestMatch = contestPolicy.isContributor(null, req.user._id);
    contestPolicy.hideDeletedContests(contestMatch, req.user.permissions);
    contestPolicy.matchNickname(contestMatch, req.params.nickname);

    Contest.findOne(contestMatch)
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            [ 'name', 'scheduled_to' ].forEach(function(key) {
                if(req.body[key] !== undefined) {
                    contestDoc[key] = req.body[key];
                }
            });

            return contestDoc.save();
        })
        .then(handleLib.handleReturn.bind(null, res, 'contest'))
        .catch(handleLib.handleError.bind(null, res));
}


/**
 * Remove a contest.
 */
function removeContest(req, res) {
    // check if the user has permission to see this contest info.
    var contestMatch = contestPolicy.isContributor(null, req.user._id);
    contestPolicy.hideDeletedContests(contestMatch, req.user.permissions);
    contestPolicy.matchNickname(contestMatch, req.params.nickname);

    Contest.findOne(contestMatch)
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            contestDoc.deleted_at = new Date();

            return contestDoc.save();
        })
        .then(handleLib.handlePopulate.bind(null, 'author contributors'))
        .then(handleLib.handleReturn.bind(null, res, 'contest'))
        .catch(handleLib.handleError.bind(null, res));
}

/**
 * Routes
 */

var router = express.Router();

router.route('/contest/')
    .get(getAllContests)
    .post(createContest);

router.route('/contest/:nickname')
    .get(getContest)
    .put(editContest)
    .delete(removeContest);

module.exports = router;
