'use strict';

var utilQuery = require('./util.query');

// get all the solutions runs.
function getSolutionRuns(conn, args, user) {
	return utilQuery.select(
		conn,
		'sr.*',
		'solution_run sr',
		[{
			table:     'solution s',
			condition: 's.id = sr.solution_id'
		}, {
			table:     'test_case tc',
			condition: 'tc.id = sr.test_case_id'
		}, {
			table:     'problem p',
			condition: 'p.id = s.problem_id'
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
			's.id':       args.solution_id,
			's.nickname': args.solution_nickname,
			'tc.id':      args.test_case_id,
			'sr.id':      args.solution_run_id,
			'sr.number':  args.solution_run_number
		}
	);
}

// get a specific solution, from a specific problem, given that this user is a contributor to the contest it belongs to.
function getOneSolutionRun(conn, args, user) {
	return utilQuery.selectOne(
		conn,
		's.*',
		'solution s',
		[{
			table:     'problem p',
			condition: 'p.id = s.problem_id'
		}, {
			table:     'contest_contributor cc',
			condition: 'cc.contest_id = p.contest_id'
		}],
		{
			'cc.user_id':   user.id,
			's.id':         args.solution_id,
			's.nickname':   args.solution_nickname,
			's.deleted_at': args.deleted_at
		}
	);
}

module.exports = {
	getSolutionRuns:   getSolutionRuns,
	getOneSolutionRun: getOneSolutionRun
};
