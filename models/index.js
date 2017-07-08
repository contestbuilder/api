'use strict';

var mongoose = require('mongoose'),
    _        = require('underscore');

module.exports = function(db) {
    mongoose.connect('mongodb://localhost:27017/' + (db || 'contest_builder'));

    var User    = require('./user.model');
    var Contest = require('./contest.model');
    var Log     = require('./log.model');

    var models = {
        User   : User,
        Contest: Contest,
        Log    : Log
    };

    return models;
};
