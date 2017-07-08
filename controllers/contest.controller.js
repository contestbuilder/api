'use strict';

var express   = require('express'),
    handleLib = require('../libraries/handle.lib'),
    models    = require('mongoose').models,
    Contest   = models.Contest;

/**
 * Controllers
 */

/**
 * Get all the contests.
 */
function getAllContests(req, res) {
    var query = {
        $or: [
            {author: req.user._id},
            {contributors: req.user._id}
        ]
    };

    if(req.query.deleted !== 'true') {
        query.deleted_at = {
            $exists: false
        };
    }

    Contest.find(query)
        .populate('author contributors')
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
                author      : req.user._id,
                name        : req.body.name,
                contributors: [req.user._id],
                scheduled_to: req.body.scheduled_to,
                problems    : []
            });

            return contest.save();
        })
        .then(function(contestDoc) {
            return handleLib.handleLog(req, contestDoc, {
                message: 'Contest ' + contestDoc.name + ' criado.',
                contest: contestDoc._id
            });
        })
        .then(handleLib.handleReturn.bind(null, res, 'contest'))
        .catch(handleLib.handleError.bind(null, res));
}


/**
 * Get a specific contest.
 */
function getContest(req, res) {
    Contest.findOne({
        nickname: req.params.nickname,
        '$or'   : [
            {author: req.user._id},
            {contributors: req.user._id}
        ]
    })
        .populate('author contributors')
        .then(handleLib.handleFindOne)
        .then(handleLib.handleReturn.bind(null, res, 'contest'))
        .catch(handleLib.handleError.bind(null, res));
}


/**
 * Edit a contest.
 */
function editContest(req, res) {
    Contest.findOne({
        nickname: req.params.nickname,
        '$or'   : [
            {author: req.user._id},
            {contributors: req.user._id}
        ]
    })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            ['name', 'scheduled_to'].forEach(function(key) {
                if(req.body[key] !== undefined) {
                    contestDoc[key] = req.body[key];
                }
            });

            return contestDoc.save();
        })
        .then(function(contestDoc) {
            return handleLib.handleLog(req, contestDoc, {
                message: 'Contest ' + contestDoc.name + ' editado.',
                contest: contestDoc._id
            });
        })
        .then(handleLib.handleReturn.bind(null, res, 'contest'))
        .catch(handleLib.handleError.bind(null, res));
}


/**
 * Remove a contest.
 */
function removeContest(req, res) {
    Contest.findOne({
        nickname: req.params.nickname,
        '$or'   : [
            {author: req.user._id},
            {contributors: req.user._id}
        ]
    })
        .then(handleLib.handleFindOne)
        .then(function(contestDoc) {
            contestDoc.deleted_at = new Date();

            return contestDoc.save();
        })
        .then(function(contestDoc) {
            return handleLib.handleLog(req, contestDoc, {
                message: 'Contest' + contestDoc.name + ' excluído.',
                contest: contestDoc._id
            });
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
