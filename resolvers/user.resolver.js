'use strict';

var utilQuery = require('../queries/util.query'),
    userQuery = require('../queries/user.query');

var query = (args, something, context) => {
    console.log('args', args, something);
    return userQuery.getUsers(context.conn, something, context.user);
};

var fields = {
    contests: (parent, args, context) => {
        return utilQuery.select(
            context.conn,
            'c.*',
            'contest c',
            [{
                table:     'contest_contributor cb',
                condition: 'cb.contest_id = c.id'
            }],
            {
                'cb.user_id': parent.id
            }
        );
    }
};

module.exports = {
    query:  query,
    fields: fields
};
