'use strict';

var utilQuery = require('./util.query');

// get all the users.
function getUsers(conn, args, user) {
	args = args || {};
	user = user || {};
	console.log(args, user);

	return utilQuery.select(
		conn,
		'u.*',
		'user u',
		[],
		{
			'u.id':       args.id,
			'u.username': args.user_username
		}
	);
}

// get a specific user.
function getOneUser(conn, args, user) {
	return utilQuery.selectOne(
		conn,
		'u.*',
		'user u',
		[],
		{
			'u.id':       args.user_id,
			'u.username': args.user_username
		}
	);
}

module.exports = {
	getUsers:   getUsers,
	getOneUser: getOneUser
};
