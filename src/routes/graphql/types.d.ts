import { UUIDType } from './types/uuid.js';
import { MemberTypeId } from '../member-types/schemas.js';

type MemberTypeIdEnum = `${MemberTypeId}`; 

type User = {
  id: UUIDType,
  name: string,
  balance: float,
};

type MemberType = {
  id: MemberTypeId,
  discount: float,
  postsLimitPerMonth: int,
};

type Post = {
  id: UUIDType,
  title: string,
  content: string,
  authorId: UUIDType,
};

type Profile = {
  id: UUIDType,
  isMale: boolean,
  yearOfBirth: int,
  userId: UUIDType,
  memberTypeId: MemberTypeId,
};

export { User, MemberType, Post, Profile, MemberTypeIdEnum };