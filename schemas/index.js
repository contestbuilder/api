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
    require('./checker.schema'),
    require('./testCase.schema'),
    require('./solutionRun.schema'),
    require('./text.schema'),
    require('./file.schema'),
    `
        type Query {
            user(
                user_id:       Int, 
                user_username: String
            ): [User]

            contest(
                contest_id:       Int,
                contest_nickname: String
            ): [Contest]

            problem(
                problem_id:       Int,
                problem_nickname: String
            ): [Problem]

            solution(
                solution_id:       Int,
                solution_nickname: String
            ): [Solution]

            checker(
                checker_id:       Int,
                checker_nickname: String
            ): [Checker]

            test_case(
                test_case_id: Int
            ): [TestCase]

            solution_run(
                solution_run_id:     Int,
                solution_run_number: Int
            ): [SolutionRun]

            text(
                text_id: Int
            ): [Text]

            file(
                file_id: Int
            ): [File]
        }
    `
].join('\n');

module.exports = graphqlTools.makeExecutableSchema({
    typeDefs:  typeDefs,
    resolvers: resolvers
});
