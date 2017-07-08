'use strict';

var mongoose = require('mongoose'),
	Schema   = mongoose.Schema;

var logSchema = new Schema({
    message: {
        type    : String,
        required: true
    },
    date   : {
        type   : Date,
        default: Date.now
    },
    author : {
        type    : Schema.Types.ObjectId,
        ref     : 'User',
        required: true
    },
    contest: {
        type: Schema.Types.ObjectId,
        ref : 'Contest'
    },
    problem: {
        type: Schema.Types.ObjectId,
        ref : 'Problem'
    }
});

module.exports = logSchema;
