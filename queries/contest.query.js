'use strict';

var utilQuery = require('./util.query');

// get all the contests this user is a contributor to.
function getContests(conn, args, user) {
	return utilQuery.select(
		conn,
		'c.*',
		'contest c',
        [{
            table:     'contest_contributor cb',
            condition: 'cb.contest_id = c.id'
        }],
		{
			'cb.user_id': user._id,
            'c.id':       args.contest_id,
            'c.nickname': args.contest_nickname
		}
	);
}

// get a contest that this user is a contributor to.
function getOneContest(conn, args, user) {
	return utilQuery.selectOne(
		conn,
		'c.*',
		'contest c',
        [{
            table:     'contest_contributor cb',
            condition: 'cb.contest_id = c.id'
        }],
		{
			'cb.user_id': user._id,
            'c.id':       args.contest_id,
            'c.nickname': args.contest_nickname
		}
	);
}

// count how many problems there are on this contest.
function countProblems(conn, args, user) {
	return utilQuery.selectOne(
		conn,
		'count(*) as count',
		'problem p',
		[],
		{
			'p.contest_id': args.contest_id,
			'p.deleted_at': {
				$isNull: true
			}
		}
	);
}

module.exports = {
	getContests:   getContests,
	getOneContest: getOneContest,
	countProblems: countProblems
};
