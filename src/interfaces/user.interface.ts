import { Role } from 'src/types/user.type';

export interface IUser {
  id: string;
  username: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  verificationCode?: string;
  createdAt: Date;
  updatedAt: Date;
}
