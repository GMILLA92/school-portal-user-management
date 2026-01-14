describe('Auth redirect flow (storage-based)', () => {
  it('Admin visiting /login is redirected to /directory', () => {
    cy.visit('/login', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'school-portal-auth',
          JSON.stringify({ id: 'u-admin', name: 'G. Milla', role: 'Admin' }),
        );
      },
    });

    cy.location('pathname').should('eq', '/directory');
    cy.findByLabelText('Current user').should('contain.text', 'Admin');
  });

  it('Staff visiting /login is redirected to /insights', () => {
    cy.visit('/login', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'school-portal-auth',
          JSON.stringify({ id: 'u-staff', name: 'Sam Calder', role: 'Staff' }),
        );
      },
    });

    cy.location('pathname').should('eq', '/insights');
    cy.findByLabelText('Current user').should('contain.text', 'Staff');
  });
});
