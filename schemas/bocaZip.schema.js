'use strict';

var mongoose     = require('mongoose'),
	Schema       = mongoose.Schema,
    statusEnum   = require('../enums/status.enum');

var bocaZipSchema = new Schema({
    timestamp: {
        type:    Date,
        default: Date.now
    },
    author: {
        type:     Schema.Types.ObjectId,
        ref:      'User',
        required: true
    },
    VersionId: String,
    status: {
        type:    String,
        enum:    statusEnum,
        default: statusEnum.default
    },
    err: String
});

module.exports = bocaZipSchema;
