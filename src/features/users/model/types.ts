export type UserRole = 'Student' | 'Teacher' | 'Guardian' | 'Admin' | 'Staff';

export type UserStatus = 'Active' | 'Invited' | 'Suspended' | 'Archived';

export type Pronouns = 'she/her' | 'he/him' | 'they/them' | 'prefer not to say';

export type Campus = 'North' | 'South';

export interface UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  pronouns: Pronouns;
  email: string;
  registeredAt: string; // ISO date string
  lastLoginAt: string | null; // ISO date string or null
  roles: UserRole[];
  status: UserStatus;

  grade?: number; // Only for students
  homeroom?: string; // Only for students
  department?: string; // Only for teachers/Staff

  phone?: string;
  campus?: Campus;
  notes?: string;
  guardianOfStudentId?: string; // Only for Guardian
}

export interface User {
  id: string;
  fullName: string;
  pronouns: Pronouns;
  email: string;
  registeredAt: Date;
  lastLoginAt: Date | null;
  roles: UserRole[];
  status: UserStatus;

  grade?: number;
  homeroom?: string;
  department?: string;
}

export type UpdateUserPayload = Partial<Pick<UserDTO, 'roles' | 'status'>>;
