import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql } from 'graphql';
// import { getUsers } from '../../../test/utils/requests.js';
// import { gqlQuery } from '../../../test/utils/requests.js'

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      console.log(req);
      return {};
    },
  });

  // fastify.route({
  //   url: '/users',
  //   method: 'GET',
  //   schema: {
  //     ...createGqlResponseSchema,
  //     response: {
  //       200: gqlResponseSchema,
  //     },
  //   },
  //   async handler(req) {
  //     const { res, body } = await getUsers(fastify);
  //     return {};
  //   },
  // });
};

