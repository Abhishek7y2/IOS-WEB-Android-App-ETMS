describe('01 - Startup & Authentication (E2E-SYS & E2E-AUTH)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('E2E-SYS-001: Application startup and load root route', () => {
    cy.visit('/');
    // Check that Next.js rendered without blank screen or fatal error overlay
    cy.get('body').should('be.visible');
    cy.get('body').should('not.be.empty');
    cy.get('#__next-build-watcher').should('not.exist');
    cy.get('body').should('not.contain.text', 'Unhandled Runtime Error');
    cy.get('body').should('not.contain.text', 'Module not found');
  });

  it('E2E-AUTH-001: Unauthenticated user accessing protected route is redirected to login', () => {
    cy.visit('/tasks');
    cy.url().should('include', '/login');
    cy.contains('Welcome Back!').should('be.visible');
    cy.contains('button', 'Continue with Email').should('be.visible');
  });

  it('E2E-AUTH-002: Valid user login through UI loads dashboard', () => {
    cy.visit('/login');
    cy.contains('button', 'Continue with Email').click();
    cy.get('#email-input').should('be.visible').type('admin@enterprise.test');
    cy.get('#password-input').should('be.visible').type('AdminPass@123');
    cy.get('button[type="submit"]').click();

    // Verify redirected to dashboard /
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    cy.get('body').should('contain.text', 'Admin');
    cy.get('aside').should('exist');
  });

  it('E2E-AUTH-003: Invalid password displays controlled authentication error', () => {
    cy.visit('/login');
    cy.contains('button', 'Continue with Email').click();
    cy.get('#email-input').should('be.visible').type('admin@enterprise.test');
    cy.get('#password-input').should('be.visible').type('WrongPassword999!');
    cy.get('button[type="submit"]').click();

    // Verify error displayed and user stays on login page
    cy.url().should('include', '/login');
    cy.contains(/incorrect password|invalid|failed/i, { timeout: 10000 }).should('be.visible');
  });

  it('E2E-AUTH-004: Logout clears session and blocks protected routes', () => {
    // First login
    cy.visit('/login');
    cy.contains('button', 'Continue with Email').click();
    cy.get('#email-input').type('admin@enterprise.test');
    cy.get('#password-input').type('AdminPass@123');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    // Click logout button in sidebar
    cy.contains('button', 'Log Out').click();

    // Should redirect to /login
    cy.url().should('include', '/login');

    // Attempt direct navigation back to /
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  it('E2E-AUTH-005: Browser refresh after login retains valid session', () => {
    cy.visit('/login');
    cy.contains('button', 'Continue with Email').click();
    cy.get('#email-input').type('admin@enterprise.test');
    cy.get('#password-input').type('AdminPass@123');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    // Reload page
    cy.reload();

    // Session remains active
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    cy.get('aside').should('exist');
    cy.get('body').should('contain.text', 'Workspace');
  });
});
