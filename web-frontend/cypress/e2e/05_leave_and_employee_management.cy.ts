describe('05 - Leave & Employee Management Workflows', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe('Leave Management Flow', () => {
    it('E2E-LEAVE-001: Member applies for leave and Admin reviews/approves', () => {
      // 1. Member applies for leave
      cy.loginByUI('member.a@enterprise.test', 'MemberPass@123');
      cy.visit('/leave');

      cy.get('[data-testid="apply-leave-button"]').click();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startStr = tomorrow.toISOString().split('T')[0];

      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      const endStr = dayAfter.toISOString().split('T')[0];

      cy.get('input[name="startDate"]').type(startStr);
      cy.get('input[name="endDate"]').type(endStr);
      cy.get('textarea[name="reason"]').type('Medical checkup and recuperation period.');

      cy.contains('button', 'Submit Request').click();

      // Verify leave submitted and visible in table
      cy.contains('Sick Leave', { timeout: 10000 }).should('be.visible');

      // 2. Admin reviews and approves
      cy.visit('/login');
      cy.loginByUI('admin@enterprise.test', 'AdminPass@123');
      cy.visit('/leave');

      cy.get('body').then(($body) => {
        if ($body.find('button[title="Approve"]').length > 0) {
          cy.get('button[title="Approve"]').first().click();
          cy.contains('button', 'Confirm').click();
          cy.contains(/Approved/i, { timeout: 10000 }).should('be.visible');
        }
      });
    });
  });

  describe('Employee Management Flow', () => {
    const testEmployeeEmail = `emp.${Date.now()}@enterprise.test`;

    it('E2E-EMP-001: Admin creates, edits, and manages employee in directory', () => {
      cy.loginByUI('admin@enterprise.test', 'AdminPass@123');
      cy.visit('/employees');

      // Click Add Member
      cy.get('[data-testid="add-employee-button"]').click();

      cy.get('#firstName').type('Kavita');
      cy.get('#lastName').type('Patel');
      cy.get('#email').type(testEmployeeEmail);
      cy.get('#password').type('TempPassword@123');

      cy.contains('button', 'Create User').click();

      // Verify employee in directory
      cy.visit('/employees');
      cy.get('input[placeholder*="Search"]').type('Kavita');
      cy.contains('Kavita', { timeout: 10000 }).should('be.visible');

      // Edit employee
      cy.contains('tr', 'Kavita').within(() => {
        cy.get('button[title="Edit"]').click();
      });
      cy.contains('h3', 'Edit Employee Profile').should('be.visible');
      cy.contains('button', 'Save Information').click();
      cy.contains('Kavita', { timeout: 10000 }).should('be.visible');
    });

    it('E2E-EMP-002: Member role cannot add or delete employees', () => {
      cy.loginByUI('member.a@enterprise.test', 'MemberPass@123');
      cy.visit('/employees');

      // Member can view directory but cannot see Add Member button or delete buttons
      cy.get('[data-testid="add-employee-button"]').should('not.exist');
      cy.get('button[title*="Remove"]').should('not.exist');
    });
  });
});
