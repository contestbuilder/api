'use strict';

var utilQuery    = require('../queries/util.query'),
    problemQuery = require('../queries/problem.query');

var query = (args, something, context) => {
    return problemQuery.getProblems(context.conn, args, context.user);
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

    solutions: (parent, args, context) => {
        return utilQuery.select(
            context.conn,
            's.*',
            'solution s',
            [],
            {
                's.problem_id': parent.id
            }
        );
    },

    test_cases: (parent, args, context) => {
        return utilQuery.select(
            context.conn,
            'tc.*',
            'test_case tc',
            [],
            {
                'tc.problem_id': parent.id
            }
        );
    }
};

module.exports = {
	query:  query,
	fields: fields
};
