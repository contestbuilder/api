'use strict';

var utilQuery = require('./util.query');

// get all the solutions from a specific problem, given that this user is a contributor to the contest the problem belongs to.
function getSolutions(conn, args, user) {
	return utilQuery.select(
		conn,
		's.*',
		'solution s',
		[{
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
			'cc.user_id': user._id,
			'c.id':       args.contest_id,
			'c.nickname': args.contest_nickname,
			'p.id':       args.problem_id,
			'p.nickname': args.problem_nickname,
			's.id':       args.solution_id,
			's.nickname': args.solution_nickname
		}
	);
}

// get a specific solution, from a specific problem, given that this user is a contributor to the contest it belongs to.
function getOneSolution(conn, args, user) {
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
			'cc.user_id':   user._id,
			's.id':         args.solution_id,
			's.nickname':   args.solution_nickname,
			's.deleted_at': args.deleted_at
		}
	);
}

module.exports = {
	getSolutions:   getSolutions,
	getOneSolution: getOneSolution
};
