type AuthRole = 'Admin' | 'Teacher' | 'Staff';

const STORAGE_KEY = 'school-portal-auth';

const userForRole = (role: AuthRole) => {
  if (role === 'Admin') return { id: 'u-admin', name: 'G. Milla', role: 'Admin' } as const;
  if (role === 'Teacher')
    return { id: 'u-teacher', name: 'Robin Buckley', role: 'Teacher' } as const;
  return { id: 'u-staff', name: 'Sam Calder', role: 'Staff' } as const;
};

declare global {
  namespace Cypress {
    interface Chainable {
      loginBypass(role: AuthRole): Chainable<void>;
      logoutBypass(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginBypass', (role: AuthRole) => {
  cy.window().then((win) => {
    win.localStorage.setItem(STORAGE_KEY, JSON.stringify(userForRole(role)));
  });
});

Cypress.Commands.add('logoutBypass', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem(STORAGE_KEY);
  });
});

export {};
