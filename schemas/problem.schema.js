'use strict';

var mongoose         = require('mongoose'),
	Schema           = mongoose.Schema,
	problemLogSchema = require('./problemLog.schema'),
	solutionSchema   = require('./solution.schema'),
    testCaseSchema   = require('./testCase.schema');

var problemSchema = new Schema({
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
    v:          [ problemLogSchema ],
    solutions:  [ solutionSchema ],
    test_cases: [ testCaseSchema ]
});

module.exports = problemSchema;
