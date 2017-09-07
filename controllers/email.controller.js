'use strict';

var express   = require('express'),
	handleLib = require('../libraries/handle.lib'),
	emailLib  = require('../libraries/email.lib'),
    mongoose  = require('mongoose'),
    models    = mongoose.models,
    ObjectId  = mongoose.Types.ObjectId,
    User      = models.User;

/**
 * Controllers
 */

function regularInvitation(req, res) {
    var query = {
        $or: [{
            username: req.params.username
        }]
    };

    if(ObjectId.isValid(req.params.username)) {
        query.$or.push({
            _id: ObjectId(req.params.username)
        });
    }

    User.findOne(query)
        .then(handleLib.handleFindOne)
        .then(function(userDoc) {
        	return emailLib.regularInvitation(
        		userDoc.email,
        		userDoc._id,
        		userDoc.name
        	);
        })
        .then(function(emailInfo) {
        	return res.json({
        		message: 'E-mail sent.'
        	});
        })
        .catch(handleLib.handleError.bind(null, res));
}

/**
 * Routes
 */

var router = express.Router();

router.route('/regular-invitation/:username')
	.post(regularInvitation);

module.exports = router;
