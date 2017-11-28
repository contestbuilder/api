'use strict';

var graphqlTools = require('graphql-tools'),
    resolvers    = require('../resolvers');

var typeDefs = [
    `
        scalar Date
    `,
    require('./user.schema'),
    require('./contest.schema'),
    require('./problem.schema'),
    require('./solution.schema'),
    require('./testCase.schema'),
    require('./solutionRun.schema'),
    require('./text.schema'),
    `
        type Query {
            user(id: Int, username: String): [User]

            contest(id: Int, nickname: String): [Contest]

            problem(id: Int, nickname: String): [Problem]

            solution(id: Int, nickname: String): [Solution]

            test_case(id: Int): [TestCase]

            solution_run(id: Int, number: Int): [SolutionRun]

            text(id: Int): [Text]
        }
    `
].join('\n');

module.exports = graphqlTools.makeExecutableSchema({
    typeDefs:  typeDefs,
    resolvers: resolvers
});
