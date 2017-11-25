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
    `
        type Query {
            user(id: Int, username: String): [User]

            contest(id: Int, nickname: String): [Contest]

            problem(id: Int, nickname: String): [Problem]

            solution(id: Int, nickname: String): [Solution]
        }
    `
].join('\n');

module.exports = graphqlTools.makeExecutableSchema({
    typeDefs:  typeDefs,
    resolvers: resolvers
});
