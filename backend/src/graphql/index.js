'use strict';

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');

const typeDefs = require('./schemas/index');
const resolvers = require('./resolvers/index');
const logger = require('../utils/logger');

async function initGraphQL(app) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== 'production',
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => ({ req }),
    })
  );

  logger.info('GraphQL ready at /graphql');

  return server;
}

module.exports = { initGraphQL };