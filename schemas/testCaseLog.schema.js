'use strict';

var mongoose     = require('mongoose'),
	Schema       = mongoose.Schema;

var testCaseLogSchema = new Schema({
    input:     {
        type:     String,
        required: true
    },
    output:    {
        type:     String,
        required: true
    },
    order:     {
        type:    Number,
        default: 1
    },
    critical:  {
        type:    Boolean,
        default: false
    },
    timestamp: {
        type:    Date,
        default: Date.now
    }
});

module.exports = testCaseLogSchema;
