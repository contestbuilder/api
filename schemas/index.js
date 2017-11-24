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
    `
        type Query {
            user: [User]

            contest(id: Int, nickname: String): [Contest]

            problem(id: Int, nickname: String): [Problem]
        }
    `
].join('\n');

module.exports = graphqlTools.makeExecutableSchema({
    typeDefs:  typeDefs,
    resolvers: resolvers
});
