'use strict';

var utilQuery    = require('../queries/util.query'),
    checkerQuery = require('../queries/checker.query');

var query = (obj, args, context) => {
    return checkerQuery.getCheckers(context.conn, args, context.user);
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
    }

    // runs: (parent, args, context) => {
    //     return utilQuery.select(
    //         context.conn,
    //         '*',
    //         'solution_run',
    //         null,
    //         {
    //             'solution_id': parent.id
    //         }
    //     );
    // }
};

module.exports = {
	query:  query,
	fields: fields
};
