import { UUIDType } from './types/uuid.js';

export const User = {
  id: UUIDType,
  name: string,
  balance: float,
};

export const MemberType = {
  id: MemberTypeId,
  discount: float,
  postsLimitPerMonth: int,
};

export const Post = {
  id: UUIDType,
  title: string,
  content: string,
  authorId: UUIDType,
};

export const Profile = {
  id: UUIDType,
  isMale: boolean,
  yearOfBirth: int,
  userId: UUIDType,
  memberTypeId: MemberTypeId,
};



