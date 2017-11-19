'use strict';

var utilQuery = require('../queries/util.query');

var query = (root, args) => {
    return utilQuery.select('*', 'problem');
};

var fields = {
    author: (parent, args) => {
        return utilQuery.select(
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
