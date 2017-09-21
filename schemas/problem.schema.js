'use strict';

var mongoose         = require('mongoose'),
	Schema           = mongoose.Schema,
	problemLogSchema = require('./problemLog.schema'),
	solutionSchema   = require('./solution.schema'),
    checkerSchema    = require('./checker.schema'),
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
    file: {
        name: {
            type: String
        }
    },
    v:          [ problemLogSchema ],
    solutions:  [ solutionSchema ],
    checkers:   [ checkerSchema  ],
    test_cases: [ testCaseSchema ]
});

module.exports = problemSchema;
