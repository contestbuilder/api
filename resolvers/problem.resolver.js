'use strict';

var utilQuery = require('../queries/util.query');

var query = (root, args, context) => {
    return utilQuery.select(
        context.conn,
        '*',
        'problem'
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
    }
};

module.exports = {
	query:  query,
	fields: fields
};
