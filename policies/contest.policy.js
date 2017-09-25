'use strict';

var ObjectId = require('mongoose').Types.ObjectId;


function isContributor(match, user_id) {
	match = match || {};
	match.$and = match.$and || [];

	match.$and.push({
		$or: [
			{ author:       ObjectId(user_id) },
			{ contributors: ObjectId(user_id) }
		]
	});

	return match;
}

function hideDeletedContests(match, permissions) {
	match = match || {};
	permissions = permissions || {};

	if(!permissions.view_deleted_contests) {
		match.deleted_at = {
			$exists: false
		};
	}

	return match;
}

function matchNickname(match, nickname) {
	match = match || {};

	match.nickname = nickname;

	return match;
}


module.exports = {
	isContributor:       isContributor,
	hideDeletedContests: hideDeletedContests,
	matchNickname:       matchNickname
};
