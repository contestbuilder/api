'use strict';

var mongoose          = require('mongoose'),
	Schema            = mongoose.Schema,
	testCaseLogSchema = require('./testCaseLog.schema');

var testCaseSchema = new Schema({
    deleted_at: {
        type: Date
    },
    v:          [ testCaseLogSchema ]
});

module.exports = testCaseSchema;
