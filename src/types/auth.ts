import type { User, UserRole, UserStatus } from './user';

export type { User, UserRole, UserStatus };
export type AuthResponse = {
  user: User;
  token: string;
};
