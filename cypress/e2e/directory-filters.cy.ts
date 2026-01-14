describe('Directory filtering & pagination (admin)', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.loginBypass('Admin');
    cy.visit('/directory');
    cy.findByRole('heading', { name: 'Directory' }).should('be.visible');
  });

  it('filters by search, role, and status (stable)', () => {
    cy.findAllByRole('row').then(($rows) => {
      const initialCount = $rows.length;

      cy.findByLabelText('Search users').clear().type('robin');

      cy.findAllByRole('row').should(($next) => {
        expect($next.length).to.be.greaterThan(1);
        expect($next.length).to.be.lessThan(initialCount);
      });

      cy.findByLabelText('Filter by role').select('Teacher');

      cy.findAllByRole('row').should('have.length.greaterThan', 1);

      cy.findByLabelText('Filter by status').select('Invited');

      cy.findByRole('heading', { name: 'Directory' }).should('be.visible');
    });
  });

  it('changes page size and paginates', () => {
    cy.findByLabelText('Page size').select('10');

    cy.findByRole('button', { name: 'Next' }).should('be.enabled').click();
    cy.findByText(/Page 2 \/ /i).should('exist');

    cy.findByRole('button', { name: 'Prev' }).should('be.enabled').click();
    cy.findByText(/Page 1 \/ /i).should('exist');
  });
});
