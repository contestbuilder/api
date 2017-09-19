'use strict';

var mongoose     = require('mongoose'),
	Schema       = mongoose.Schema;

var bocaZipSchema = new Schema({
    timestamp: {
        type   : Date,
        default: Date.now
    },
    author: {
        type:     Schema.Types.ObjectId,
        ref:      'User',
        required: true
    },
    VersionId: String
});

module.exports = bocaZipSchema;
