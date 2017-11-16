'use strict';

var graphqlTools = require('graphql-tools'),
    resolvers    = require('../resolvers');

var typeDefs = [
    require('./user.schema'),
    require('./contest.schema'),
    `
        type Query {
            user:    [User]
            contest: [Contest]
        }
    `
].join('\n');

module.exports = graphqlTools.makeExecutableSchema({
    typeDefs:  typeDefs,
    resolvers: resolvers
});
