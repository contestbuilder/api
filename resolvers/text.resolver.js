'use strict';

var utilQuery = require('../queries/util.query'),
    userQuery = require('../queries/user.query');

var query = (args, something, context) => {
    return utilQuery.select(
        context.conn,
        '*',
        'text',
        [],
        {
            'id': args.text_id
        }
    );
};

var fields = {
};

module.exports = {
    query:  query,
    fields: fields
};
