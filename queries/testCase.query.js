'use strict';

var utilQuery = require('./util.query');

// get all the test cases from a specific problem.
function getTestCases(conn, args, user) {
	return utilQuery.select(
		conn,
		'tc.*',
		'test_case tc',
		[{
			table:     'problem p',
			condition: 'p.id = tc.problem_id'
		}, {
			table:     'contest c',
			condition: 'c.id = p.contest_id'
		}, {
			table:     'contest_contributor cc',
			condition: 'cc.contest_id = c.id'
		}],
		{
			'cc.user_id': user.id,
			'c.id':       args.contest_id,
			'c.nickname': args.contest_nickname,
			'p.id':       args.problem_id,
			'p.nickname': args.problem_nickname,
			'tc.id':      args.test_case_id
		}
	);
}

// get one test case from a specific problem.
function getOneTestCase(conn, args, user) {
	return utilQuery.selectOne(
		conn,
		'tc.*',
		'test_case tc',
		[{
			table:     'problem p',
			condition: 'p.id = tc.problem_id'
		}, {
			table:     'contest_contributor cc',
			condition: 'cc.contest_id = p.contest_id'
		}],
		{
			'cc.user_id':    user.id,
			'tc.id':         args.test_case_id,
			'tc.deleted_at': args.deleted_at
		}
	);
}

module.exports = {
	getTestCases:   getTestCases,
	getOneTestCase: getOneTestCase
};
