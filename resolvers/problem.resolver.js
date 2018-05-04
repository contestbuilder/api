'use strict';

var utilQuery    = require('../queries/util.query'),
    problemQuery = require('../queries/problem.query');

var query = (obj, args, context) => {
    return problemQuery.getProblems(context.conn, args, context.user);
};

var fields = {
    contest: (parent, args, context) => {
        return utilQuery.selectOne(
            context.conn,
            '*',
            'contest',
            null,
            {
                'id': parent.contest_id
            }
        );
    },

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

    file: (parent, args, context) => {
        return utilQuery.selectOne(
            context.conn,
            '*',
            'file',
            null,
            {
                'id': parent.file_id
            }
        );
    },

    solutions: (parent, args, context) => {
        var deletedCondition = {
            $isNull: true
        };
        if(args.show_deleted === true) {
            deletedCondition = null;
        }

        return utilQuery.select(
            context.conn,
            's.*',
            'solution s',
            [],
            {
                's.problem_id': parent.id,
                's.deleted_at': deletedCondition
            }
        );
    },

    test_cases: (parent, args, context) => {
        var deletedCondition = {
            $isNull: true
        };
        if(args.show_deleted === true) {
            deletedCondition = null;
        }

        return utilQuery.select(
            context.conn,
            'tc.*',
            'test_case tc',
            [],
            {
                'tc.problem_id': parent.id,
                'tc.deleted_at': deletedCondition
            }
        );
    }
};

module.exports = {
	query:  query,
	fields: fields
};
