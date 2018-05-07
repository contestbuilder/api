'use strict';

var utilQuery = require('../queries/util.query');

var query = (obj, args, context) => {
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
