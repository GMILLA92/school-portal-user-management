describe('Directory: teacher read-only', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.loginBypass('Teacher');
  });

  it('can open user details but does not see Edit action', () => {
    cy.visit('/directory');

    cy.contains('button', 'View').first().click();
    cy.location('pathname').should('match', /^\/directory\/\d+$/);

    cy.findByRole('button', { name: /^edit$/i }).should('not.exist');

    cy.visit(`${cy.location('pathname') as any}?mode=edit`);
    cy.findByRole('button', { name: /save/i }).should('not.exist');
    cy.findByLabelText('Role').should('not.exist');
    cy.findByLabelText('Status').should('not.exist');
  });
});
