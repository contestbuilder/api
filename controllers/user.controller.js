'use strict';

var express   = require('express'),
    handleLib = require('../libraries/handle.lib'),
    mongoose  = require('mongoose'),
    models    = mongoose.models,
    ObjectId  = mongoose.Types.ObjectId,
    User      = models.User;

/**
 * Controllers
 */

function getUsers(req, res) {
    var query = {};

    if(req.query.deleted !== 'true') {
        query.deleted_at = {
            $exists: false
        };
    }

    User.find(query)
        .then(handleLib.handleReturn.bind(null, res, 'users'))
        .catch(handleLib.handleError.bind(null, res));
}

function createUser(req, res) {
    handleLib.handleRequired(req.body, [
        'username', 'email'
    ])
        .then(function() {
            var user = new User({
                username: req.body.username,
                email   : req.body.email
            });

            return user.save();
        })
        .then(handleLib.handleReturn.bind(null, res, 'user'))
        .catch(handleLib.handleError.bind(null, res));
}

function getUser(req, res) {
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
        .then(handleLib.handleReturn.bind(null, res, 'user'))
        .catch(handleLib.handleError.bind(null, res));
}

function editUser(req, res) {
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
            ['name', 'username', 'password'].forEach(function(key) {
                if(req.body[key] !== undefined) {
                    userDoc[key] = req.body[key];
                }
            });

            return userDoc.save();
        })
        .then(handleLib.handleReturn.bind(null, res, 'user'))
        .catch(handleLib.handleError.bind(null, res));
}

function deleteUser(req, res) {
    User.findOne({
        username: req.params.username
    })
        .then(handleLib.handleFindOne)
        .then(function(userDoc) {
            userDoc.deleted_at = new Date();

            return userDoc.save();
        })
        .then(handleLib.handleReturn.bind(null, res, 'user'))
        .catch(handleLib.handleError.bind(null, res));
}

/**
 * Routes
 */

var router = express.Router();

router.route('/user/')
    .get(getUsers)
    .post(createUser);

router.route('/user/:username')
    .get(getUser)
    .put(editUser)
    .delete(deleteUser);

module.exports = router;
