describe('07 - Responsive Design & Console Health', () => {
  const viewports = [
    { name: 'Desktop', width: 1280, height: 800 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  viewports.forEach((vp) => {
    describe(`Viewport: ${vp.name} (${vp.width}x${vp.height})`, () => {
      beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();
        cy.viewport(vp.width, vp.height);
      });

      it(`Renders Login page cleanly on ${vp.name}`, () => {
        cy.visit('/login');
        cy.get('body').should('be.visible');
        cy.contains('Welcome Back!').should('be.visible');
      });

      it(`Renders Dashboard and Navigation on ${vp.name}`, () => {
        cy.loginByUI('admin@enterprise.test', 'AdminPass@123');
        cy.visit('/');
        cy.contains('Checking authentication...').should('not.exist');
        cy.get('body').should('be.visible');

        if (vp.name === 'Desktop') {
          cy.get('aside').should('be.visible');
        } else {
          // On Tablet and Mobile, verify responsive navigation trigger and drawer
          cy.get('[data-testid="mobile-menu-button"]').should('be.visible').click();
          cy.contains('a', /Task Manager|Task List/i).should('be.visible');
        }
      });

      it(`Renders Tasks page on ${vp.name}`, () => {
        cy.loginByUI('admin@enterprise.test', 'AdminPass@123');
        cy.visit('/tasks');
        cy.contains('Checking authentication...').should('not.exist');
        cy.contains('h2', 'Tasks').should('be.visible');
      });

      it(`Renders Employees page on ${vp.name}`, () => {
        cy.loginByUI('admin@enterprise.test', 'AdminPass@123');
        cy.visit('/employees');
        cy.contains('Checking authentication...').should('not.exist');
        cy.contains('h2', 'Team Members').should('be.visible');
      });

      it(`Renders Leave page on ${vp.name}`, () => {
        cy.loginByUI('admin@enterprise.test', 'AdminPass@123');
        cy.visit('/leave');
        cy.contains('Checking authentication...').should('not.exist');
        cy.contains('h1', 'Leave Management').should('be.visible');
      });
    });
  });

  describe('Console and Network Stability', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('E2E-SYS-002: Critical page navigations trigger no unhandled client exceptions', () => {
      cy.loginByUI('admin@enterprise.test', 'AdminPass@123');

      const routes = ['/', '/tasks', '/employees', '/leave', '/settings'];
      routes.forEach((route) => {
        cy.visit(route);
        cy.contains('Checking authentication...').should('not.exist');
        cy.get('body').should('be.visible');
        cy.get('body').should('not.contain.text', 'Unhandled Runtime Error');
      });
    });
  });
});
