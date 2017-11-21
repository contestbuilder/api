'use strict';

var utilQuery = require('./util.query');

// get all the problems from a specific contest that this user is a contributor to.
function getProblems(conn, args, user) {
	return utilQuery.select(
		conn,
		'p.*',
		'problem p',
		[{
		}],
		{
			// ''
		}
	);
}

// get a specific problem from a specific contest that this user is a contributor to.
function getOneProblem(conn, args, user) {
	return utilQuery.selectOne(conn);
}

module.exports = {
	getProblems:   getProblems,
	getOneProblem: getOneProblem
};
