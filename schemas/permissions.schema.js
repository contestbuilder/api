'use strict';

var mongoose = require('mongoose'),
	Schema   = mongoose.Schema;

var permissionsSchema = {
	view_deleted_contests: {
		type: Boolean
	},
    delete_user: {
        type: Boolean
    },
    delete_contest: {
    	type: Boolean
    }
};

module.exports = permissionsSchema;
