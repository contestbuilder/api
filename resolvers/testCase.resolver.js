'use strict';

var utilQuery     = require('../queries/util.query'),
    testCaseQuery = require('../queries/testCase.query');

var query = (args, something, context) => {
    return testCaseQuery.getTestCases(context.conn, args, context.user);
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
    },

    input_file: (parent, args, context) => {
        return utilQuery.selectOne(
            context.conn,
            '*',
            'file',
            null,
            {
                'id': parent.input_file_id
            }
        );
    },

    output_file: (parent, args, context) => {
        return utilQuery.selectOne(
            context.conn,
            '*',
            'file',
            null,
            {
                'id': parent.output_file_id
            }
        );
    }
};

module.exports = {
	query:  query,
	fields: fields
};
