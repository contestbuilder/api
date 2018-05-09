'use strict';

var contestResolvers     = require('./contest.resolver'),
    userResolvers        = require('./user.resolver'),
    problemResolvers     = require('./problem.resolver'),
    solutionResolvers    = require('./solution.resolver'),
    checkerResolvers     = require('./checker.resolver'),
    customResolvers      = require('./custom.resolver'),
    testCaseResolvers    = require('./testCase.resolver'),
    solutionRunResolvers = require('./solutionRun.resolver'),
    textResolvers        = require('./text.resolver'),
    fileResolvers        = require('./file.resolver');

var resolvers = {
    Date: customResolvers.date,

    Query: {
        user:         userResolvers.query,
        contest:      contestResolvers.query,
        problem:      problemResolvers.query,
        solution:     solutionResolvers.query,
        checker:      checkerResolvers.query,
        test_case:    testCaseResolvers.query,
        solution_run: solutionRunResolvers.query,
        text:         textResolvers.query,
        file:         fileResolvers.query
    },

    User: userResolvers.fields,

    Contest: contestResolvers.fields,

    Problem: problemResolvers.fields,

    Solution: solutionResolvers.fields,

    Checker: checkerResolvers.fields,

    TestCase: testCaseResolvers.fields,

    SolutionRun: solutionRunResolvers.fields,

    Text: textResolvers.fields,

    File: fileResolvers.fields
};

module.exports = resolvers;
