import { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLSchema } from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberTypeIdEnum } from './types/MemberTypeId.js';
import { MemberType } from './types/MemberType.js';
import { Post } from './types/Post.js';
import { Profile } from './types/Profile.js';
import { User } from './types/User.js';
import { parseResolveInfo, simplifyParsedResolveInfoFragmentWithType, ResolveTree } from 'graphql-parse-resolve-info';

export const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
      resolve: async (_parent, _args, { prisma }) => {
        return prisma.memberType.findMany();
      },
    },
    memberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
      },
      resolve: async (_parent, { id }, { prisma }) => {
        return prisma.memberType.findUnique({
          where: { id },
        });
      },
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (_parent, _args, context, resolveInfo) => {
        const { prisma, loaders } = context;
        const parsedInfo = parseResolveInfo(resolveInfo);
        
        let needsUserSubscribedTo = false;
        let needsSubscribedToUser = false;
        
        if (parsedInfo) {
          let fieldsByTypeName: Record<string, Record<string, unknown>> | undefined;
          
          if (typeof parsedInfo === 'object' && 'name' in parsedInfo) {
            const simplified = simplifyParsedResolveInfoFragmentWithType(parsedInfo as ResolveTree, User);
            fieldsByTypeName = simplified.fieldsByTypeName as Record<string, Record<string, unknown>>;
          } else if (typeof parsedInfo === 'object') {
            fieldsByTypeName = parsedInfo as Record<string, Record<string, unknown>>;
          }
          
          if (fieldsByTypeName) {
            const userFields = fieldsByTypeName.User || {};
            needsUserSubscribedTo = Boolean(userFields.userSubscribedTo);
            needsSubscribedToUser = Boolean(userFields.subscribedToUser);
          }
        }
        
        const include: {
          userSubscribedTo?: boolean;
          subscribedToUser?: boolean;
        } = {};
        
        if (needsUserSubscribedTo) {
          include.userSubscribedTo = true;
        }
        if (needsSubscribedToUser) {
          include.subscribedToUser = true;
        }
        
        const users = Object.keys(include).length > 0
          ? await prisma.user.findMany({ include })
          : await prisma.user.findMany();
        
        for (const user of users) {
          loaders.usersById.prime(user.id, user);
        }
        
        return users;
      },
    },
    user: {
      type: User,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, { id }, { prisma }) => {
        return prisma.user.findUnique({
          where: { id },
        });
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: async (_parent, _args, { prisma }) => {
        return prisma.post.findMany();
      },
    },
    post: {
      type: Post,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, { id }, { prisma }) => {
        return prisma.post.findUnique({
          where: { id },
        });
      },
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Profile))),
      resolve: async (_parent, _args, { prisma }) => {
        return prisma.profile.findMany();
      },
    },
    profile: {
      type: Profile,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_parent, { id }, { prisma }) => {
        return prisma.profile.findUnique({
          where: { id },
        });
      },
    },
  },
});