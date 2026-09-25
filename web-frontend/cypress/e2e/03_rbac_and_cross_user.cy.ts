describe('03 - Role-Based Access Control (RBAC) & Cross-User Security', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('E2E-RBAC-001: Member role UI protections and restricted views', () => {
    // Login as Member A
    cy.loginByUI('member.a@enterprise.test', 'MemberPass@123');
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    // In sidebar: Member sees "Task List" and "Team Members", NOT "Archive"
    cy.get('aside').should('contain.text', 'Task List');
    cy.get('aside').should('not.contain.text', 'Archive');

    // Visit /tasks
    cy.visit('/tasks');
    // "Create New Task" button should NOT be present for member
    cy.get('[data-testid="create-task-button"]').should('not.exist');

    // Direct navigation to admin-only page /archive
    cy.visit('/archive');
    // Verify access denied message
    cy.contains('Access Denied').should('be.visible');
    cy.contains(/restricted to administrators only|access denied/i).should('be.visible');
  });

  it('E2E-RBAC-002: Backend authorization rejects sensitive operations by Member (API enforcement)', () => {
    cy.loginByUI('member.a@enterprise.test', 'MemberPass@123');

    // Attempt to invoke admin-only endpoints directly with member cookie session
    cy.request({
      method: 'GET',
      url: 'http://localhost:5000/api/tasks/archived',
      failOnStatusCode: false,
    }).then((response) => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('E2E-RBAC-003: Admin role has full administrative controls', () => {
    cy.loginByUI('admin@enterprise.test', 'AdminPass@123');
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    // Sidebar contains Admin items
    cy.get('aside').should('contain.text', 'Task Manager');
    cy.get('aside').should('contain.text', 'Archive');

    // Visit /tasks
    cy.visit('/tasks');
    cy.get('[data-testid="create-task-button"]').should('be.visible');

    // Visit /archive
    cy.visit('/archive');
    cy.get('body').should('not.contain.text', 'Access Denied');
  });

  it('E2E-RBAC-004: Superadmin role has highest-level features', () => {
    cy.loginByUI('superadmin@enterprise.test', 'SuperAdmin@123');
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    cy.get('aside').should('contain.text', 'Task Manager');
    cy.get('aside').should('contain.text', 'Archive');
  });

  it('E2E-SEC-001: Cross-User Task Security - Member cannot modify another user\'s private task', () => {
    // 1. Authenticate as Admin to create a task assigned to Member A
    cy.loginByUI('admin@enterprise.test', 'AdminPass@123');
    cy.visit('/tasks');

    cy.intercept('POST', '**/api/tasks').as('createTaskReq');

    cy.get('[data-testid="create-task-button"]').click();
    const taskTitle = `Private Task A ${Date.now()}`;
    cy.get('[data-testid="task-title-input"]').type(taskTitle);
    cy.get('[data-testid="task-desc-input"]').type('This is a confidential task assigned strictly to Member A.');
    cy.contains('label', 'Assignee').find('select').contains('option', /Rahul Sharma|Priya Singh/).then(($opt) => {
      cy.contains('label', 'Assignee').find('select').select($opt.val());
    });
    cy.get('[data-testid="submit-task-button"]').click();

    cy.wait('@createTaskReq').then((interception) => {
      const createdTaskId = interception.response?.body?.data?._id || interception.response?.body?.data?.id;

      // 2. Authenticate as Member B
      cy.visit('/login');
      cy.loginByUI('member.b@enterprise.test', 'MemberPass@123');

      // 3. Member B attempts unauthorized modification of Member A's task via API
      if (createdTaskId) {
        cy.request({
          method: 'PUT',
          url: `http://localhost:5000/api/tasks/${createdTaskId}`,
          body: { title: 'Unauthorized Tamper by Member B' },
          failOnStatusCode: false,
        }).then((res) => {
          expect([401, 403, 404]).to.include(res.status);
        });

        // 4. Member B attempts unauthorized deletion of Member A's task via API
        cy.request({
          method: 'DELETE',
          url: `http://localhost:5000/api/tasks/${createdTaskId}`,
          failOnStatusCode: false,
        }).then((res) => {
          expect([401, 403, 404]).to.include(res.status);
        });
      }

      // 5. On UI: Member B visits /tasks and cannot edit or delete Member A's task
      cy.visit('/tasks');
      cy.get('body').then(($body) => {
        if ($body.find(`tr:contains("${taskTitle}")`).length) {
          cy.contains('tr', taskTitle).within(() => {
            cy.get('button[title*="Edit" i]').should('not.exist');
            cy.get('button[title*="Delete" i]').should('not.exist');
          });
        }
      });
    });
  });
});
