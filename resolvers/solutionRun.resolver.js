'use strict';

var utilQuery        = require('../queries/util.query'),
    solutionRunQuery = require('../queries/solutionRun.query');

var query = (args, something, context) => {
    return solutionRunQuery.getSolutionRuns(context.conn, args, context.user);
};

var fields = {
    solution: (parent, args, context) => {
        return utilQuery.selectOne(
            context.conn,
            '*',
            'solution',
            null,
            {
                'id': parent.solution_id
            }
        );
    },

    test_case: (parent, args, context) => {
        return utilQuery.selectOne(
            context.conn,
            '*',
            'test_case',
            null,
            {
                'id': parent.test_case_id
            }
        );
    }
};

module.exports = {
	query:  query,
	fields: fields
};
