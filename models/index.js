'use strict';

var mongoose = require('mongoose'),
    _        = require('underscore');

mongoose.Promise = require('q').Promise;

module.exports = function(db_path) {
    mongoose.connect(db_path);

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
