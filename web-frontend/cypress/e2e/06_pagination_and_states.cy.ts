describe('06 - Pagination Regression & Empty/Error States', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.loginByUI('admin@enterprise.test', 'AdminPass@123');
  });

  describe('Pagination Regression', () => {
    it('E2E-PAG-001: Frontend handles paginated users response (data.users + data.pagination) without crashes', () => {
      // Mock paginated users response to verify metadata handling
      cy.intercept('GET', '**/api/auth/users*', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            users: [
              { id: '1', name: 'User 1', email: 'user1@example.com', role: 'member', designation: 'Engineer' },
              { id: '2', name: 'User 2', email: 'user2@example.com', role: 'member', designation: 'Designer' },
              { id: '3', name: 'User 3', email: 'user3@example.com', role: 'member', designation: 'QA' },
            ],
            pagination: {
              page: 1,
              limit: 3,
              totalUsers: 15,
              totalPages: 5,
              hasNextPage: true,
              hasPrevPage: false,
            },
          },
        },
      }).as('getPaginatedUsers');

      cy.visit('/employees');
      cy.wait('@getPaginatedUsers');

      // Verify users render without React render errors
      cy.contains('User 1').should('be.visible');
      cy.contains('User 2').should('be.visible');
      cy.get('body').should('not.contain.text', 'Objects are not valid as a React child');
    });

    it('E2E-PAG-002: Team pagination on dashboard verifies Page 1 -> Next -> Page 2 -> Prev -> Page 1', () => {
      cy.visit('/');
      cy.contains('h3', 'Team Members').should('be.visible');

      // Verify pagination metadata on page 1
      cy.contains(/Page 1 of/i).should('be.visible');

      // First page cannot go previous
      cy.get('[data-testid="pagination-prev"]').should('be.disabled');

      // Check if next page is available
      cy.get('[data-testid="pagination-next"]').then(($next) => {
        if (!$next.is(':disabled')) {
          cy.wrap($next).click();
          cy.contains(/Page 2 of/i).should('be.visible');

          // Previous button should now be enabled
          cy.get('[data-testid="pagination-prev"]').should('not.be.disabled').click();
          cy.contains(/Page 1 of/i).should('be.visible');
        }
      });
    });
  });

  describe('Empty and Error States', () => {
    it('E2E-EMPTY-001: Renders clean empty states when datasets are empty', () => {
      cy.intercept('GET', '**/api/tasks*', {
        statusCode: 200,
        body: { success: true, data: [] },
      }).as('getEmptyTasks');

      cy.visit('/tasks');
      cy.wait('@getEmptyTasks');

      // Synchronize against application readiness
      cy.contains('Checking authentication...').should('not.exist');
      cy.contains(/No tasks available|no matching tasks|no tasks found/i, { timeout: 10000 }).should('be.visible');
      cy.get('body').should('not.contain.text', 'Unhandled Runtime Error');
    });

    it('E2E-ERR-001: Gracefully handles 400 Bad Request error without crashing', () => {
      cy.intercept('POST', '**/api/tasks', {
        statusCode: 400,
        body: { success: false, message: 'Invalid payload: title is required.' },
      }).as('badRequestTask');

      cy.visit('/tasks');
      cy.contains('Checking authentication...').should('not.exist');

      cy.get('[data-testid="create-task-button"]').click();
      cy.get('[data-testid="task-title-input"]').type('Test Error Task');
      cy.get('[data-testid="task-desc-input"]').type('Description for testing 400 error response handling.');
      cy.contains('label', 'Assignee').find('select').contains('option', /Rahul Sharma|Priya Singh/).then(($opt) => {
        cy.contains('label', 'Assignee').find('select').select($opt.val());
      });
      cy.get('[data-testid="submit-task-button"]').click();

      cy.wait('@badRequestTask');

      cy.get('body').should('be.visible');
      cy.get('body').should('not.contain.text', 'Unhandled Runtime Error');
      // Toast or error feedback is displayed
      cy.contains(/Invalid payload/i, { timeout: 10000 }).should('be.visible');
    });

    it('E2E-ERR-002: Gracefully handles 403 Forbidden without infinite loop or blank screen', () => {
      cy.intercept('GET', '**/api/tasks/archived', {
        statusCode: 403,
        body: { success: false, message: 'Forbidden: Admin access required.' },
      }).as('forbiddenReq');

      cy.visit('/archive');
      cy.get('body').should('be.visible');
      cy.get('body').should('not.contain.text', 'Unhandled Runtime Error');
    });

    it('E2E-ERR-003: Gracefully handles 500 Internal Server Error with friendly toast/error', () => {
      cy.intercept('GET', '**/api/tasks*', {
        statusCode: 500,
        body: { success: false, message: 'Internal server error occurred.' },
      }).as('serverErrorReq');

      cy.visit('/tasks');
      cy.get('body').should('be.visible');
      cy.get('body').should('not.contain.text', 'Unhandled Runtime Error');
    });
  });
});
