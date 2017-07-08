'use strict';

var express    = require('express'),
    handleLib  = require('../libraries/handle.lib'),
    models     = require('mongoose').models,
    Log        = models.Log;

/**
 * Controllers
 */
function getAllLogs(req, res) {
    var query = {};
    if(req.query.contest) {
        query.contest = req.query.contest;
    }
    if(req.query.author) {
        query.author = req.query.author;
    }

    Log.find(query)
        .sort('-date')
        .populate('author contest')
        .then(handleLib.handleReturn.bind(null, res, 'logs'))
        .catch(handleLib.handleError.bind(null, res));
};

function getLog(req, res) {
    Log.findById(req.params.id)
        .populate('author contest')
        .then(handleLib.handleFindOne)
        .then(handleLib.handleReturn.bind(null, res, 'log'))
        .catch(handleLib.handleError.bind(null, res));
};

/**
 * Routes
 */

var router = express.Router();

router.route('/log')
    .get(getAllLogs);

router.route('/log/:id')
    .get(getLog);

module.exports = router;
