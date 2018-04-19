'use strict';

var utilQuery    = require('../queries/util.query'),
    contestQuery = require('../queries/contest.query');

var query = (args, something, context) => {
    return contestQuery.getContests(context.conn, something, context.user);
};

var fields = {
    author: (parent, args, context) => {
        return utilQuery.selectOne(
            context.conn,
            '*',
            'user',
            null,
            {
                'id': parent.author_id
            }
        );
    },

    contributors: (parent, args, context) => {
        return utilQuery.select(
            context.conn,
            'u.*',
            'user u',
            [{
                table:     'contest_contributor cb',
                condition: 'cb.user_id = u.id'
            }],
            {
                'cb.contest_id': parent.id,
                'cb.user_id':    args.id
            }
        );
    },

    problems: (parent, args, context) => {
        return utilQuery.select(
            context.conn,
            'p.*',
            'problem p',
            [],
            {
                'p.contest_id': parent.id
            }
        );
    }
};

module.exports = {
	query:  query,
	fields: fields
};
