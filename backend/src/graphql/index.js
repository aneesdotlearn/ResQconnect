'use strict';

const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schemas/index');
const resolvers = require('./resolvers/index');
const logger = require('../utils/logger');

async function initGraphQL(app) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
    introspection: process.env.NODE_ENV !== 'production',
  });

  await server.start();

  // bodyParserConfig: false — trust the global express.json() in app.js,
  // which has already parsed req.body by the time this middleware runs.
  // Apollo's own body parser would otherwise try to read an already-consumed
  // request stream and every query would arrive empty. Same reasoning for
  // cors: false — CORS is already handled globally in app.js.
  server.applyMiddleware({ app, path: '/graphql', bodyParserConfig: false, cors: false });

  logger.info(`GraphQL ready at /graphql`);
  return server;
}

module.exports = { initGraphQL };