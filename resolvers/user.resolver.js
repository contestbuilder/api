'use strict';

var utilQuery = require('../queries/util.query'),
    userQuery = require('../queries/user.query');

var query = (obj, args, context) => {
    return userQuery.getUsers(context.conn, args, context.user);
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
                'cb.user_id': parent.id,
                'c.id':       args.contest_id,
                'c.nickname': args.contest_nickname
            }
        );
    }
};

module.exports = {
    query:  query,
    fields: fields
};
