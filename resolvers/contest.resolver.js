'use strict';

var utilQuery = require('../queries/util.query');

var query = (obj, args, context) => {
    return utilQuery.select(
        context.conn,
        'c.*',
        'contest c',
        [{
            table:     'contest_contributor cb',
            condition: 'cb.contest_id = c.id'
        }],
        {
            'cb.user_id': context.user._id,
            'c.id':       args.id,
            'c.nickname': args.nickname
        }
    );
};

var fields = {
    author: (parent, args, context) => {
        return utilQuery.select(
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
                'cb.contest_id': parent.id
            }
        );
    },
    problems: (parent, args, context) => {
        return utilQuery.select(
            context.conn,
            'p.*',
            'problem p',
            [{
                table:     'contest_problem cp',
                condition: 'cp.problem_id = p.id'
            }],
            {
                'cp.contest_id': parent.id
            }
        );
    }
};

module.exports = {
	query:  query,
	fields: fields
};
