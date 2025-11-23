import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLList, GraphQLNonNull } from 'graphql';
import { UUIDType } from './uuid.js';
import { Post } from './Post.js';
import { Profile } from './Profile.js';

export const User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: Profile,
      resolve: async (parent, _args, { loaders }) => {
        return loaders.profilesByUserId.load(parent.id);
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: async (parent, _args, { loaders }) => {
        return loaders.postsByAuthorId.load(parent.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (parent, _args, { loaders }) => {
        const subscriptions = await loaders.subscriptionsBySubscriberId.load(parent.id);
        const authorIds = subscriptions.map((sub) => sub.authorId);
        if (authorIds.length === 0) return [];
        return Promise.all(authorIds.map((id) => loaders.usersById.load(id))).then((users) =>
          users.filter((user) => user !== null)
        );
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (parent, _args, { loaders }) => {
        const subscriptions = await loaders.subscriptionsByAuthorId.load(parent.id);
        const subscriberIds = subscriptions.map((sub) => sub.subscriberId);
        if (subscriberIds.length === 0) return [];
        return Promise.all(subscriberIds.map((id) => loaders.usersById.load(id))).then((users) =>
          users.filter((user) => user !== null)
        );
      },
    },
  }),
});