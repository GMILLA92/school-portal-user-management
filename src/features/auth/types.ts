export type AuthRole = 'Admin' | 'Teacher' | 'Staff';

export interface AuthUser {
  id: string;
  name: string;
  role: AuthRole;
}
