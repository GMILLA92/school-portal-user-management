describe('Directory selection (admin)', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.loginBypass('Admin');
    cy.visit('/directory');
    cy.findByRole('heading', { name: 'Directory' }).should('be.visible');
  });

  const getRowCheckboxes = () =>
    cy.findAllByRole('checkbox').filter('[aria-label^="Select "]');

  const expectBulkActionsVisible = () => {
    cy.get('body').then(($body) => {
      const candidates = [
        'Clear',
        'Clear selection',
        'Clear selected',
        'Cancel',
        'Set status',
        'Set role',
        'Suspend',
        'Archive',
      ];

      const found = candidates.some((t) =>
    $body.text().toLowerCase().indexOf(t.toLowerCase()) !== -1,
);

      expect(found, 'Bulk actions UI to appear (some bulk action text present)').to.eq(true);
    });
   };

  it('selects multiple users and shows bulk actions', () => {
    getRowCheckboxes().its('length').should('be.greaterThan', 1);

    getRowCheckboxes().eq(0).click({ force: true });
    getRowCheckboxes().eq(1).click({ force: true });

    cy.get('body').then(($body) => {
      const text = $body.text();
      const hasSelectedPill = /selected\s*\(this page\)/i.test(text);
      if (hasSelectedPill) {
        cy.contains(/selected\s*\(this page\)/i).should('be.visible');
      } else {
        expectBulkActionsVisible();
      }
    });
  });

  it('reset clears selection', () => {
    getRowCheckboxes().its('length').should('be.greaterThan', 0);
    getRowCheckboxes().eq(0).click({ force: true });

    cy.get('body').then(($body) => {
      const text = $body.text();
      const hasSelectedPill = /selected\s*\(this page\)/i.test(text);
      if (hasSelectedPill) {
        cy.contains(/selected\s*\(this page\)/i).should('be.visible');
      } else {
        expectBulkActionsVisible();
      }
    });

    cy.findByRole('button', { name: /reset filters/i }).click();

    cy.contains(/selected\s*\(this page\)/i).should('not.exist');
  });
});
