'use strict';

var contestResolvers  = require('./contest.resolver'),
    userResolvers     = require('./user.resolver'),
    problemResolvers  = require('./problem.resolver'),
    solutionResolvers = require('./solution.resolver'),
    customResolvers   = require('./custom.resolver'),
    testCaseResolvers = require('./testCase.resolver');

var resolvers = {
    Date: customResolvers.date,

    Query: {
        user:      userResolvers.query,
        contest:   contestResolvers.query,
        problem:   problemResolvers.query,
        solution:  solutionResolvers.query,
        test_case: testCaseResolvers.query
    },

    User: userResolvers.fields,

    Contest: contestResolvers.fields,

    Problem: problemResolvers.fields,

    Solution: solutionResolvers.fields,

    TestCase: testCaseResolvers.fields
};

module.exports = resolvers;
