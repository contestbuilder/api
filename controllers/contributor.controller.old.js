'use strict';

var express    = require('express'),
    handleLib  = require('../libraries/handle.lib'),
    models     = require('mongoose').models,
    User       = models.User,
    Contest    = models.Contest;

/**
 * Controllers
 */

function addContributor(req, res) {
    var ctrl = {};

    handleLib.handleRequired(req.body, [
        'user_id'
    ])
    .then(function() {
        return Contest.findOne({
            nickname: req.params.nickname
        });
    })
    .then(handleLib.handleFindOne)
    .then(function(contestDoc) {
        if(contestDoc.contributors.indexOf(req.body.user_id) !== -1) {
            throw new Error('User is a contributor already.');
        }
        contestDoc.contributors.push(req.body.user_id);

        return contestDoc.save();
    })
    .then(function(contestDoc) {
        ctrl.contestDoc = contestDoc;

        return User.findById(req.body.user_id);
    })
    .then(function(userDoc) {
        return handleLib.handleLog(req, ctrl.contestDoc, {
            message: userDoc.username + ' foi adicionado como contribuidor.',
            contest: ctrl.contestDoc._id
        });
    })
    .then(handleLib.handleReturn.bind(null, res, 'contest'))
    .catch(handleLib.handleError.bind(null, res));
}

function removeContributor(req, res) {
    var ctrl = {};

    Contest.findOne({
        nickname: req.params.nickname
    })
    .then(handleLib.handleFindOne)
    .then(function(contestDoc) {
        ctrl.contestDoc = contestDoc;

        return User.findById(req.params.user_id);
    })
    .then(function(userDoc) {
        ctrl.userDoc = userDoc;

        ctrl.contestDoc.contributors = ctrl.contestDoc.contributors.filter(function(c) {
            return c.toString() != req.params.user_id;
        });

        return ctrl.contestDoc.save();
    })
    .then(function(contestDoc) {
        return handleLib.handleLog(req, contestDoc, {
            message: ctrl.userDoc.username + ' foi removido de contribuidor.',
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

router.route('/contest/:nickname/contributor/')
    .post(addContributor);

router.route('/contest/:nickname/contributor/:user_id')
    .delete(removeContributor);

module.exports = router;
