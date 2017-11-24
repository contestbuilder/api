'use strict';

var contestResolvers  = require('./contest.resolver'),
    userResolvers     = require('./user.resolver'),
    problemResolvers  = require('./problem.resolver'),
    solutionResolvers = require('./solution.resolver'),
    customResolvers   = require('./custom.resolver');

var resolvers = {
    Date: customResolvers.date,

    Query: {
        user:     userResolvers.query,
        contest:  contestResolvers.query,
        problem:  problemResolvers.query,
        solution: solutionResolvers.query
    },

    User: userResolvers.fields,

    Contest: contestResolvers.fields,

    Problem: problemResolvers.fields,

    Solution: solutionResolvers.fields
};

module.exports = resolvers;
