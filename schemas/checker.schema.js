'use strict';

var mongoose         = require('mongoose'),
	Schema           = mongoose.Schema,
    runSchema        = require('./run.schema'),
    checkerLogSchema = require('./checkerLog.schema');

var checkerSchema = new Schema({
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
    v:          [ checkerLogSchema ],
    run:        [ runSchema ]
});

module.exports = checkerSchema;
