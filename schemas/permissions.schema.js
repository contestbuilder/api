'use strict';

var mongoose = require('mongoose'),
	Schema   = mongoose.Schema;

var permissionsSchema = {
    delete_user: {
        type: Boolean
    },
    delete_contest: {
    	type: Boolean
    }
};

module.exports = permissionsSchema;
