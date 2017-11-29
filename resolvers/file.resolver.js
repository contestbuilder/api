'use strict';

var utilQuery = require('../queries/util.query');

var query = (args, something, context) => {
    return utilQuery.select(
        context.conn,
        '*',
        'file',
        [],
        {
            'id': args.file_id
        }
    );
};

var fields = {
};

module.exports = {
    query:  query,
    fields: fields
};
