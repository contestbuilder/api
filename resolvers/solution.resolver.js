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
    }
};

module.exports = {
	query:  query,
	fields: fields
};
