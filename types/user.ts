export type UserRole = 'user' | 'admin';

export type User = {
  name: string;
  age: number;
  roles: UserRole[];
  createdAt: Date;
  isDeleated: boolean;
};
