import DataLoader from 'dataloader';
import { PrismaClient, Post, MemberType, Profile, User } from '@prisma/client';
import { SubscriptionData, SubscriptionsByUser } from './types.js';

export function createLoaders(prisma: PrismaClient) {
  const allSubscriptionsByUserId = new DataLoader<string, SubscriptionsByUser>(async (userIds) => {
    const allSubscriptions = await prisma.subscribersOnAuthors.findMany({
      where: {
        OR: [
          { subscriberId: { in: [...userIds] } },
          { authorId: { in: [...userIds] } },
        ],
      },
      select: { subscriberId: true, authorId: true },
    });
    
    const subscriptionsByUserId = new Map<string, SubscriptionsByUser>();
    for (const userId of userIds) {
      subscriptionsByUserId.set(userId, { asSubscriber: [], asAuthor: [] });
    }
    for (const sub of allSubscriptions) {
      if (subscriptionsByUserId.has(sub.subscriberId)) {
        subscriptionsByUserId.get(sub.subscriberId)!.asSubscriber.push(sub);
      }
      if (subscriptionsByUserId.has(sub.authorId)) {
        subscriptionsByUserId.get(sub.authorId)!.asAuthor.push(sub);
      }
    }
    
    return userIds.map((userId) => subscriptionsByUserId.get(userId) || { asSubscriber: [], asAuthor: [] });
  });

  return {
    postsByAuthorId: new DataLoader<string, Post[]>(async (authorIds) => {
      const posts = await prisma.post.findMany({
        where: { authorId: { in: [...authorIds] } },
      });
      
      const postsByAuthorId = new Map<string, Post[]>();
      for (const authorId of authorIds) {
        postsByAuthorId.set(authorId, []);
      }
      for (const post of posts) {
        const authorPosts = postsByAuthorId.get(post.authorId) || [];
        authorPosts.push(post);
      }
      
      return authorIds.map((authorId) => postsByAuthorId.get(authorId) || []);
    }),

    memberTypesById: new DataLoader<string, MemberType | null>(async (ids) => {
      const memberTypes = await prisma.memberType.findMany({
        where: { id: { in: [...ids] } },
      });
      
      const memberTypeMap = new Map(memberTypes.map((mt) => [mt.id, mt]));
      
      return ids.map((id) => memberTypeMap.get(id) || null);
    }),

    profilesByUserId: new DataLoader<string, Profile | null>(async (userIds) => {
      const profiles = await prisma.profile.findMany({
        where: { userId: { in: [...userIds] } },
      });
      
      const profileMap = new Map(profiles.map((profile) => [profile.userId, profile]));
      
      return userIds.map((userId) => profileMap.get(userId) || null);
    }),

    usersById: new DataLoader<string, User | null>(async (ids) => {
      const users = await prisma.user.findMany({
        where: { id: { in: [...ids] } },
      });
      
      const userMap = new Map(users.map((user) => [user.id, user]));
      
      return ids.map((id) => userMap.get(id) || null);
    }),

    subscriptionsBySubscriberId: new DataLoader<string, SubscriptionData[]>(async (subscriberIds) => {
      const allSubs = await Promise.all(
        subscriberIds.map((id) => allSubscriptionsByUserId.load(id))
      );
      return allSubs.map((subs) => subs.asSubscriber);
    }),

    subscriptionsByAuthorId: new DataLoader<string, SubscriptionData[]>(async (authorIds) => {
      const allSubs = await Promise.all(
        authorIds.map((id) => allSubscriptionsByUserId.load(id))
      );
      return allSubs.map((subs) => subs.asAuthor);
    }),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;

