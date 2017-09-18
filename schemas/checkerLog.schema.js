'use strict';

var mongoose     = require('mongoose'),
	Schema       = mongoose.Schema,
    languageEnum = require('../enums/language.enum');

var checkerLogSchema = new Schema({
    language: {
        type:    String,
        enum:    languageEnum,
        default: languageEnum.default
    },
    source_code: {
        type:     String,
        required: true
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

module.exports = checkerLogSchema;
