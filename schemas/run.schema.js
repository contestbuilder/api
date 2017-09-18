'use strict';

var mongoose     = require('mongoose'),
	Schema       = mongoose.Schema,
    ObjectId     = Schema.Types.ObjectId,
    verdictEnum  = require('../enums/verdict.enum');

var solutionRunSchema = new Schema({
    run_id:       ObjectId,
    run_number:   Number,
    test_case_id: ObjectId,
    output:       String,
    duration:     Number,
    success:      Boolean,
    verdict:      {
        type:    String,
        enum:    verdictEnum,
        default: verdictEnum.default
    },
    timestamp:    {
        type:    Date,
        default: Date.now
    }
});

module.exports = solutionRunSchema;
