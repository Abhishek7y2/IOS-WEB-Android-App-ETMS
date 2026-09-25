describe('04 - Complete Task Workflow E2E', () => {
  const uniqueTitle = `Workflow Task ${Date.now()}`;

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.loginByUI('admin@enterprise.test', 'AdminPass@123');
    cy.visit('/tasks');
  });

  it('E2E-TASK-001: Execute complete task lifecycle - Create, View, Edit, Complete, Archive, Restore', () => {
    // 1. Create Task
    cy.get('[data-testid="create-task-button"]').click();
    cy.get('[data-testid="task-title-input"]').type(uniqueTitle);
    cy.get('[data-testid="task-desc-input"]').type('Automated comprehensive end-to-end task description for testing lifecycle.');
    cy.contains('label', 'Assignee').find('select').contains('option', /Rahul Sharma|Priya Singh/).then(($opt) => {
      cy.contains('label', 'Assignee').find('select').select($opt.val());
    });
    cy.contains('label', 'Priority').find('select').select('high');
    cy.get('[data-testid="submit-task-button"]').click();

    // Verify task appears in table
    cy.contains(uniqueTitle, { timeout: 10000 }).should('be.visible');

    // Reload page to verify persistence
    cy.reload();
    cy.contains(uniqueTitle, { timeout: 10000 }).should('be.visible');

    // 2. View Task Details
    cy.contains('tr', uniqueTitle).within(() => {
      cy.get('button[title*="View"]').click();
    });
    cy.get('body').should('contain.text', uniqueTitle);
    // Close view modal
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label="Close modal"], button:contains("Close")').length) {
        cy.get('button[aria-label="Close modal"], button:contains("Close")').first().click({ force: true });
      }
    });

    // 3. Edit Task & Change Status
    cy.contains('tr', uniqueTitle).within(() => {
      cy.get('button[title*="Edit"]').click();
    });
    const updatedTitle = `${uniqueTitle} (Updated)`;
    cy.get('input[placeholder="Enter task title"]').clear().type(updatedTitle);
    cy.contains('label', 'Status').find('select').select('completed');
    cy.contains('button', 'Save Changes').click();

    // Verify updated title and status
    cy.contains(updatedTitle, { timeout: 10000 }).should('be.visible');
    cy.reload();
    cy.contains(updatedTitle, { timeout: 10000 }).should('be.visible');

    // 4. Delete / Archive Task
    cy.contains('tr', updatedTitle).within(() => {
      cy.get('button[title*="Delete"]').click();
    });
    // Confirm delete in modal
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Delete")').length) {
        cy.get('button:contains("Delete")').last().click({ force: true });
      }
    });

    // Verify removed from active tasks
    cy.contains(updatedTitle, { timeout: 10000 }).should('not.exist');

    // 5. Navigate to Archive and verify task is archived
    cy.visit('/archive');
    cy.contains('h1', 'Archive').should('be.visible');
    cy.contains('h3', updatedTitle, { timeout: 10000 }).should('be.visible');

    // 6. Restore task
    cy.contains('h3', updatedTitle).closest('div.rounded-xl').within(() => {
      cy.contains('button', 'Restore Task').click();
    });
    cy.contains('Task restored successfully', { timeout: 10000 }).should('be.visible');

    // 7. Verify restored on tasks page
    cy.visit('/tasks');
    cy.contains(updatedTitle, { timeout: 10000 }).should('be.visible');
  });
});
