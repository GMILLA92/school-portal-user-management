export type UserRole = 'Admin' | 'Teacher' | 'Staff';
export type UserStatus = 'Active' | 'Inactive';

export interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string; // ISO
}

export interface UsersQueryParams {
  q?: string;
  role?: UserRole | 'All';
  status?: UserStatus | 'All';
  page: number;
  pageSize: number;
  sortBy?: 'name' | 'email' | 'role' | 'status' | 'createdAt';
  sortDir?: 'asc' | 'desc';
}

export interface UsersQueryResponse {
  data: DirectoryUser[];
  total: number;
  page: number;
  pageSize: number;
}
