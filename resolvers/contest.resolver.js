'use strict';

var utilQuery    = require('../queries/util.query'),
    contestQuery = require('../queries/contest.query');

var query = (obj, args, context) => {
    return contestQuery.getContests(context.conn, args, context.user);
};

var fields = {
    author: (parent, args, context) => {
        return utilQuery.selectOne(
            context.conn,
            'u.*',
            'user u',
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
                'cb.user_id':    args.contributor_id
            }
        );
    },

    problems: (parent, args, context) => {
        var deletedCondition = {
            $isNull: true
        };
        if(args.show_deleted === true) {
            deletedCondition = null;
        }

        return utilQuery.select(
            context.conn,
            'p.*',
            'problem p',
            [],
            {
                'p.contest_id': parent.id,
                'p.deleted_at': deletedCondition
            }
        );
    }
};

module.exports = {
	query:  query,
	fields: fields
};
