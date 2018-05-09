'use strict';

var utilQuery = require('./util.query');

// get all the problems from a specific contest that this user is a contributor to.
function getProblems(conn, args, user) {
	return utilQuery.select(
		conn,
		'p.*',
		'problem p',
		[{
			table:     'contest_contributor cc',
			condition: 'cc.contest_id = p.contest_id'
		}, {
			table:     'contest c',
			condition: 'c.id = p.contest_id'
		}],
		{
			'cc.user_id': user.id,
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
			table:     'contest_contributor cc',
			condition: 'cc.contest_id = p.contest_id'
		}],
		{
			'cc.user_id':   user.id,
			'p.id':         args.problem_id,
			'p.nickname':   args.problem_nickname,
			'p.deleted_at': args.deleted_at
		}
	);
}

// count how many solutions this problem has.
function countSolutions(conn, args, user) {
	return utilQuery.selectOne(
		conn,
		'count(*) as count',
		'solution s',
		[{
			table:     'problem p',
			condition: 'p.id = s.problem_id'
		}, {
            table:     'contest_contributor cb',
            condition: 'cb.contest_id = p.contest_id'
        }],
		{
			'cb.user_id':   user.id,
			's.problem_id': args.problem_id,
			's.deleted_at': {
				$isNull: true
			}
		}
	);
}

// count how many checkers this problem has.
function countCheckers(conn, args, user) {
	return utilQuery.selectOne(
		conn,
		'count(*) as count',
		'checker c',
		[{
			table:     'problem p',
			condition: 'p.id = c.problem_id'
		}, {
            table:     'contest_contributor cb',
            condition: 'cb.contest_id = p.contest_id'
        }],
		{
			'cb.user_id':   user.id,
			'c.problem_id': args.problem_id,
			'c.deleted_at': {
				$isNull: true
			}
		}
	);
}

// count how many test cases this problem has.
function countTestCases(conn, args, user) {
	return utilQuery.selectOne(
		conn,
		'count(*) as count',
		'test_case tc',
		[{
			table:     'problem p',
			condition: 'p.id = tc.problem_id'
		}, {
			table:     'contest_contributor cb',
			condition: 'cb.contest_id = p.contest_id'
		}],
		{
			'cb.user_id':    user.id,
			'tc.problem_id': args.problem_id,
			'tc.deleted_at': {
				$isNull: true
			}
		}
	);
}

// count how many runs were made for any solution on this problem.
function getHighestSolutionRunNumber(conn, args, user) {
	return utilQuery.selectOne(
		conn,
		'max(sr.number) as highest_run_number',
		'solution_run sr',
		[{
			table:     'solution s',
			condition: 's.id = sr.solution_id'
		}],
		{
			's.problem_id': args.problem_id
		}
	);
}

module.exports = {
	getProblems:   getProblems,
	getOneProblem: getOneProblem,

	countSolutions: countSolutions,
	countCheckers:  countCheckers,
	countTestCases: countTestCases,

	getHighestSolutionRunNumber: getHighestSolutionRunNumber
};
