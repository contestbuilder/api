'use strict';

var utilQuery     = require('../queries/util.query'),
    solutionQuery = require('../queries/solution.query');

var query = (args, something, context) => {
    return solutionQuery.getSolutions(context.conn, args, context.user);
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

    problem: (parent, args, context) => {
        return utilQuery.selectOne(
            context.conn,
            '*',
            'problem',
            null,
            {
                'id': parent.problem_id
            }
        );
    }
};

module.exports = {
	query:  query,
	fields: fields
};
