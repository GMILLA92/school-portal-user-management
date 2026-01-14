import { describe, expect, it } from 'vitest';

import { mapUserDtoToUser } from './mappers';

import type { UserDTO } from './types';

describe('mapUserDtoToUser', () => {
  it('maps fields and converts dates correctly', () => {
    const dto: UserDTO = {
      id: '1',
      firstName: 'Mike',
      lastName: 'Wheeler',
      pronouns: 'he/him',
      email: 'mike@example.com',
      registeredAt: new Date('2024-01-01').toISOString(),
      lastLoginAt: new Date('2024-02-01').toISOString(),
      roles: ['Student'],
      status: 'Active',
      grade: 9,
      homeroom: 'A1',
      department: undefined,
      campus: 'North',
      phone: '+1 (555) 000-0000',
      notes: undefined,
    };

    const user = mapUserDtoToUser(dto);

    expect(user.id).toBe('1');
    expect(user.fullName).toBe('Mike Wheeler');
    expect(user.pronouns).toBe('he/him');
    expect(user.email).toBe('mike@example.com');
    expect(user.roles).toEqual(['Student']);
    expect(user.status).toBe('Active');

    expect(user.registeredAt).toBeInstanceOf(Date);
    expect(user.lastLoginAt).toBeInstanceOf(Date);
  });

  it('sets lastLoginAt to null when dto value is null', () => {
    const dto = {
      id: '2',
      firstName: 'Will',
      lastName: 'Byers',
      pronouns: 'they/them',
      email: 'will@example.com',
      registeredAt: new Date('2024-01-01').toISOString(),
      lastLoginAt: null,
      roles: ['Student'],
      status: 'Invited',
    } as UserDTO;

    const user = mapUserDtoToUser(dto);

    expect(user.lastLoginAt).toBeNull();
  });

  it('handles missing optional fields gracefully', () => {
    const dto = {
      id: '3',
      firstName: 'Robin',
      lastName: 'Buckley',
      pronouns: 'she/her',
      email: 'robin@example.com',
      registeredAt: new Date('2024-01-01').toISOString(),
      lastLoginAt: null,
      roles: ['Teacher'],
      status: 'Active',
    } as UserDTO;

    const user = mapUserDtoToUser(dto);

    expect(user.fullName).toBe('Robin Buckley');
    expect(user.department).toBeUndefined();
  });
});
