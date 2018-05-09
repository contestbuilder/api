'use strict';

var utilQuery = require('./util.query');

// get all the checkers from a specific problem, given that this user is a contributor to the contest the problem belongs to.
function getCheckers(conn, args, user) {
	return utilQuery.select(
		conn,
		'c.*',
		'checker c',
		[{
			table:     'problem p',
			condition: 'p.id = c.problem_id'
		}, {
			table:     'contest co',
			condition: 'co.id = p.contest_id'
		}, {
			table:     'contest_contributor cc',
			condition: 'cc.contest_id = co.id'
		}],
		{
			'cc.user_id':  user.id,
			'co.id':       args.contest_id,
			'co.nickname': args.contest_nickname,
			'p.id':        args.problem_id,
			'p.nickname':  args.problem_nickname,
			'c.id':        args.checker_id,
			'c.nickname':  args.checker_nickname
		}
	);
}

// get a specific checker, from a specific problem, given that this user is a contributor to the contest it belongs to.
function getOneChecker(conn, args, user) {
	return utilQuery.selectOne(
		conn,
		'c.*',
		'checker c',
		[{
			table:     'problem p',
			condition: 'p.id = c.problem_id'
		}, {
			table:     'contest_contributor cc',
			condition: 'cc.contest_id = p.contest_id'
		}],
		{
			'cc.user_id':   user.id,
			'c.id':         args.checker_id,
			'c.nickname':   args.checker_nickname,
			'c.deleted_at': args.deleted_at
		}
	);
}

module.exports = {
	getCheckers:   getCheckers,
	getOneChecker: getOneChecker
};
