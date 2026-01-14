import { http, HttpResponse } from 'msw';

import type {
  Pronouns,
  UpdateUserPayload,
  UserDTO,
  UserRole,
  UserStatus,
} from '../features/users/model';

const FIRST_NAMES = [
  'Eleven',
  'Mike',
  'Dustin',
  'Lucas',
  'Max',
  'Will',
  'Nancy',
  'Robin',
  'Steve',
  'Eddie',
  'Erica',
  'Joyce',
  'Hopper',
  'Alex',
  'Jordan',
  'Taylor',
  'Morgan',
  'Sam',
  'Casey',
  'Riley',
  'Jamie',
  'Avery',
  'Quinn',
  'Rowan',
  'Emerson',
  'Finley',
  'Harper',
  'Parker',
  'Noah',
  'Emma',
  'Olivia',
  'Liam',
  'Sophia',
  'Mia',
  'Ethan',
  'Amelia',
  'Ella',
  'Isaac',
  'Grace',
  'Chloe',
  'Aiden',
  'Kael',
  'Nyra',
  'Elio',
  'Zara',
  'Milo',
  'Iris',
  'Soren',
  'Luna',
  'Taro',
  'Anya',
];

const LAST_NAMES = [
  'Byers',
  'Wheeler',
  'Henderson',
  'Sinclair',
  'Hargrove',
  'Munson',
  'Harrington',
  'Buckley',
  'Ives',
  'Smith',
  'Johnson',
  'Brown',
  'Davis',
  'Miller',
  'Wilson',
  'Moore',
  'Anderson',
  'Thomas',
  'Jackson',
  'White',
  'Harris',
  'Martin',
  'Thompson',
  'Clark',
  'Lewis',
  'Young',
  'Garcia',
  'Martinez',
  'Perez',
  'Torres',
  'Flores',
  'Nguyen',
  'Kim',
  'Patel',
  'Singh',
  'Kowalski',
  'Rossi',
  'Bianchi',
  'Dubois',
  'Moreau',
  'Sato',
  'Tanaka',
  'Holloway',
  'Ashcroft',
  'Calder',
  'Whitmore',
  'Redford',
  'Kingsley',
];

const PRONOUNS: Pronouns[] = ['she/her', 'he/him', 'they/them', 'prefer not to say'];

const HOMEROOMS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'];
const DEPARTMENTS = [
  'Math',
  'Science',
  'Languages',
  'Arts',
  'Physical Ed',
  'Counseling',
  'Administration',
  'Support',
];

const CAMPUSES = ['North', 'South'] as const;
const pickCampus = (rand: () => number) => CAMPUSES[Math.floor(rand() * CAMPUSES.length)];

const makePhone = (rand: () => number) => {
  const n = () => Math.floor(rand() * 10);
  return `+1 (555) ${n()}${n()}${n()}-${n()}${n()}${n()}${n()}`;
};

const NOTES = [
  'Prefers email contact.',
  'Needs accessibility accommodations.',
  'New enrolment this term.',
  'Onboarding in progress.',
  'Part-time schedule.',
  'Emergency contact verified.',
];

const pick = <T>(arr: T[], idx: number) => arr[idx % arr.length];

// deterministic PRNG
const seeded = (seed: number) => {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  return () => (x = (x * 16807) % 2147483647) / 2147483647;
};

const isoDaysAgo = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

const currentSchoolYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return month >= 7 ? year : year - 1;
};

const calcGradYear = (grade: number) => {
  const base = currentSchoolYear();
  return base + (12 - grade);
};

const makeStudentEmail = (idNum: number, grade: number) => {
  const grad = calcGradYear(grade);
  return `s${grad}-${String(idNum).padStart(4, '0')}@northridge.edu`;
};

const makeStaffEmail = (first: string, last: string, collision: number) => {
  const base = `${slugify(first)}.${slugify(last)}`;
  return collision === 0 ? `${base}@northridge.edu` : `${base}${collision}@northridge.edu`;
};

const makeGuardianEmail = (first: string, last: string, collision: number) => {
  const base = `${slugify(first)}.${slugify(last)}`;
  return collision === 0 ? `${base}@familymail.test` : `${base}${collision}@familymail.test`;
};

const statusForRole = (rand: () => number, role: UserRole): UserStatus => {
  const roll = rand();
  const invitedWeight = role === 'Student' || role === 'Guardian' ? 0.12 : 0.05;

  if (roll < 0.8) return 'Active';
  if (roll < 0.8 + invitedWeight) return 'Invited';
  if (roll < 0.95) return 'Suspended';
  return 'Archived';
};

const generateUsers = (count: number, seed = 42): UserDTO[] => {
  const rand = seeded(seed);

  const users: UserDTO[] = [];
  const staffEmailCollisions = new Map<string, number>();
  const guardianEmailCollisions = new Map<string, number>();

  for (let i = 1; i <= count; i += 1) {
    const firstName = pick(FIRST_NAMES, Math.floor(rand() * 1000) + i);
    const lastName = pick(LAST_NAMES, Math.floor(rand() * 1000) + i);

    const roleRoll = rand();
    const role: UserRole =
      roleRoll < 0.7
        ? 'Student'
        : roleRoll < 0.82
          ? 'Teacher'
          : roleRoll < 0.92
            ? 'Guardian'
            : roleRoll < 0.97
              ? 'Staff'
              : 'Admin';

    const roles: UserRole[] = role === 'Admin' ? ['Admin', 'Staff'] : [role];

    const status = statusForRole(rand, role);

    // registration over last 2 years, with students slightly more recent
    const registeredDaysAgoBase = role === 'Student' ? 500 : 730;
    const registeredDaysAgo = Math.floor(rand() * registeredDaysAgoBase);
    const registeredAt = isoDaysAgo(registeredDaysAgo);

    const lastLoginAt =
      status === 'Invited' || status === 'Archived' ? null : isoDaysAgo(Math.floor(rand() * 45)); // last 45 days

    const pronouns = pick(PRONOUNS, Math.floor(rand() * 1000) + i);

    const campus = pickCampus(rand);
    const phone = makePhone(rand);
    const notes = rand() < 0.35 ? pick(NOTES, Math.floor(rand() * 1000) + i) : undefined;

    // role-specific fields + email patterns
    let email = '';
    let grade: number | undefined;
    let homeroom: string | undefined;
    let department: string | undefined;

    if (role === 'Student') {
      grade = Math.floor(rand() * 6) + 7; // 7..12
      homeroom = pick(HOMEROOMS, Math.floor(rand() * 1000) + i);
      email = makeStudentEmail(i, grade);
    } else if (role === 'Teacher' || role === 'Staff' || role === 'Admin') {
      department = pick(DEPARTMENTS, Math.floor(rand() * 1000) + i);

      const key = `${slugify(firstName)}.${slugify(lastName)}`;
      const collision = staffEmailCollisions.get(key) ?? 0;
      staffEmailCollisions.set(key, collision + 1);

      email = makeStaffEmail(firstName, lastName, collision);
    } else {
      // Guardian
      const key = `${slugify(firstName)}.${slugify(lastName)}`;
      const collision = guardianEmailCollisions.get(key) ?? 0;
      guardianEmailCollisions.set(key, collision + 1);

      email = makeGuardianEmail(firstName, lastName, collision);
    }

    users.push({
      id: String(i),
      firstName,
      lastName,
      pronouns,
      email,
      registeredAt,
      lastLoginAt,
      roles,
      status,
      grade,
      homeroom,
      department,
      campus,
      phone,
      notes,
    });
  }

  return users;
};

const USERS_DB: UserDTO[] = generateUsers(200);

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json(USERS_DB);
  }),

  http.patch('/api/users/:id', async ({ params, request }) => {
    const { id } = params;

    const body = (await request.json().catch(() => null)) as UpdateUserPayload | null;

    if (!body || (!body.roles && !body.status)) {
      return new HttpResponse(null, { status: 400 });
    }

    const user = USERS_DB.find((u) => u.id === id);

    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }

    if (body.roles) user.roles = body.roles;
    if (body.status) user.status = body.status;

    return HttpResponse.json(user);
  }),
];
