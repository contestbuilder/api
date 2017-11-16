'use strict';

var contestResolvers = require('./contest.resolver'),
    userResolvers    = require('./user.resolver');

var resolvers = {
    Query: {
        user:    userResolvers.query,
        contest: contestResolvers.query
    },

    User: userResolvers.fields,

    Contest: contestResolvers.fields
};

module.exports = resolvers;
