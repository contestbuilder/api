'use strict';

var mongoose     = require('mongoose'),
	Schema       = mongoose.Schema;

var testCaseLogSchema = new Schema({
    // the first N characters of the input/output (in case the input is too large).
    sample_input: {
        type: String
    },
    sample_output: {
        type: String,
    },

    // flag that indicates if the input/output has more than N characters.
    large_input: {
        type:    Boolean,
        default: false
    },
    large_output: {
        type:    Boolean,
        default: false
    },

    // complete input/output
    input: {
        type:     String,
        required: true,
        select:   false
    },
    output: {
        type:     String,
        required: true,
        select:   false
    },

    // file_name on s3 (in case the input has more than N characters).
    input_file_name: {
        type: String
    },
    output_file_name: {
        type: String
    },

    order: {
        type:    Number,
        default: 1
    },
    critical: {
        type:    Boolean,
        default: false
    },
    timestamp: {
        type:    Date,
        default: Date.now
    }
});

module.exports = testCaseLogSchema;
