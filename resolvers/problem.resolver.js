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
            [{
                table:     'problem_solution ps',
                condition: 'ps.solution_id = s.id'
            }],
            {
                'ps.problem_id': parent.id
            }
        );
    }
};

module.exports = {
	query:  query,
	fields: fields
};
