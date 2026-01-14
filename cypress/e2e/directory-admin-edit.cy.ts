describe('Directory: admin view and edit', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.loginBypass('Admin');
  });

  it('navigates directory → user details → edit and saves', () => {
    cy.visit('/directory');

    cy.findByRole('heading', { name: /directory/i }).should('be.visible');

    cy.contains('button', 'View').first().click();
    cy.location('pathname').should('match', /^\/directory\/\d+$/);

    cy.findByRole('button', { name: /edit/i }).click();
    cy.location('search').should('contain', 'mode=edit');

    cy.findByLabelText('Role').select('Teacher');
    cy.findByLabelText('Status').select('Suspended');

    cy.findByRole('button', { name: /save/i }).click();

    cy.location('search').should('eq', '');
    cy.findByText(/suspended/i).should('exist');
  });
});
