'use strict';

var mongoose      = require('mongoose'),
    logSchema     = require('../schemas/log.schema');

module.exports = mongoose.model('Log', logSchema, 'logs');
