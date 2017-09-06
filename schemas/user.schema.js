'use strict';

var mongoose          = require('mongoose'),
	Schema            = mongoose.Schema,
    permissionsSchema = require('./permissions.schema');

var userSchema = new Schema({
    name       : {
        type: String
    },
    username   : {
        type    : String,
        unique  : true,
        required: true
    },
    email      : {
        type    : String,
        unique  : true,
        required: true
    },
    password   : {
        type: String
    },
    deleted_at : {
        type: Date
    },
    permissions: permissionsSchema
});

module.exports = userSchema;
