'use strict';

var utilQuery = require('./util.query');

// get all the problems from a specific contest that this user is a contributor to.
function getProblems(conn, args, user) {
	return utilQuery.select(
		conn,
		'p.*',
		'problem p',
		[{
			table:     'contest_problem cp',
			condition: 'cp.problem_id = p.id'
		}, {
			table:     'contest_contributor cc',
			condition: 'cc.contest_id = cp.contest_id'
		}, {
			table:     'contest c',
			condition: 'cp.contest_id = c.id'
		}],
		{
			'cc.user_id': user._id,
			'c.id':       args.contest_id,
			'c.nickname': args.contest_nickname,
			'p.id':       args.problem_id,
			'p.nickname': args.problem_nickname
		}
	);
}

// get a specific problem from a specific contest that this user is a contributor to.
function getOneProblem(conn, args, user) {
	return utilQuery.selectOne(
		conn,
		'p.*',
		'problem p',
		[{
			table:     'contest_problem cp',
			condition: 'cp.problem_id = p.id'
		}, {
			table:     'contest_contributor cc',
			condition: 'cc.contest_id = cp.contest_id'
		}],
		{
			'cc.user_id':   user._id,
			'p.id':         args.problem_id,
			'p.nickname':   args.problem_nickname,
			'p.deleted_at': args.deleted_at
		}
	);
}

// count how many problems there are on this contest.
function countSolutions(conn, args, user) {
	return utilQuery.selectOne(
		conn,
		'count(*) as count',
		'solution s',
		[{
			table:     'problem_solution ps',
			condition: 'ps.solution_id = s.id'
		}, {
			table:     'contest_problem cp',
			condition: 'cp.problem_id = ps.problem_id'
		}],
		{
			'cp.contest_id': args.contest_id,
			'ps.problem_id': args.problem_id,
			's.deleted_at': {
				$isNull: true
			}
		}
	);
}

module.exports = {
	getProblems:    getProblems,
	getOneProblem:  getOneProblem,
	countSolutions: countSolutions
};
