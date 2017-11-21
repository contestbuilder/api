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
            'c.id':       args.id,
            'c.nickname': args.nickname
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
            'c.id':       args.id,
            'c.nickname': args.nickname
		}
	);
}

module.exports = {
	getContests:   getContests,
	getOneContest: getOneContest
};
