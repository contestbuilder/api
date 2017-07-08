'use strict';

var mongoose = require('mongoose'),
	Schema   = mongoose.Schema;

var problemLogSchema = new Schema({
    description: {
        type    : String,
        required: true
    },
    // file
    time_limit : {
        type   : Number,
        default: 1
    },
    order      : {
        type   : Number,
        default: 1
    },
    critical   : {
        type   : Boolean,
        default: false
    },
    timestamp: {
        type:    Date,
        default: Date
    }
});

module.exports = problemLogSchema;
