'use strict';

var utilQuery = require('../queries/util.query');

var query = (root, args) => {
    return utilQuery.select('*', 'user');
};

var fields = {
    contests: (parent, args) => {
        return utilQuery.select(
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
