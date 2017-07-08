'use strict';

var mongoose      = require('mongoose'),
	Schema        = mongoose.Schema,
	problemSchema = require('./problem.schema');

var contestSchema = new Schema({
    author      : {
        type    : Schema.Types.ObjectId,
        ref     : 'User',
        required: true
    },
    name        : {
        type    : String,
        unique  : true,
        required: true
    },
    nickname    : {
        type  : String,
        unique: true
    },
    created_at  : {
        type   : Date,
        default: Date.now
    },
    scheduled_to: {
        type: Date
    },
    contributors: [{
        type: Schema.Types.ObjectId,
        ref : 'User'
    }],
    problems    : [problemSchema],
    deleted_at  : {
        type: Date
    }
});

module.exports = contestSchema;
