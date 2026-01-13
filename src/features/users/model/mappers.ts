import type { User, UserDTO } from './types';

export const mapUserDtoToUser = (dto: UserDTO): User => ({
  id: dto.id,
  fullName: `${dto.firstName} ${dto.lastName}`,
  pronouns: dto.pronouns,
  email: dto.email,
  registeredAt: new Date(dto.registeredAt),
  lastLoginAt: dto.lastLoginAt ? new Date(dto.lastLoginAt) : null,
  roles: dto.roles,
  status: dto.status,
  grade: dto.grade,
  homeroom: dto.homeroom,
  department: dto.department,
});
