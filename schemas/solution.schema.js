'use strict';

var mongoose          = require('mongoose'),
	Schema            = mongoose.Schema,
    runSchema         = require('./run.schema'),
    solutionLogSchema = require('./solutionLog.schema');

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
    run:        [ runSchema ]
});

module.exports = solutionSchema;
