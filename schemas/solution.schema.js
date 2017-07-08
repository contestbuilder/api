'use strict';

var mongoose          = require('mongoose'),
	Schema            = mongoose.Schema,
	solutionLogSchema = require('./solutionLog.schema'),
    solutionRunSchema = require('./solutionRun.schema');

var solutionSchema = new Schema({
    name:       {
        type:     String,
        required: true,
        unique:   true
    },
    nickname:   {
        type:   String,
        unique: true
    },
    deleted_at: {
        type: Date
    },
    v:          [ solutionLogSchema ],
    run:        [ solutionRunSchema ]
});

module.exports = solutionSchema;
