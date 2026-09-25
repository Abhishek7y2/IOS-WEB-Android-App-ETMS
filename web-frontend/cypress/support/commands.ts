/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      loginByUI(email: string, password: string):Chainable<void>;
      loginProgrammatically(userObj: any): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginByUI', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('body').then(($body) => {
    if ($body.text().includes('Continue with Email')) {
      cy.contains('button', 'Continue with Email').click();
    }
  });
  cy.get('#email-input').should('be.visible').clear().type(email);
  cy.get('#password-input').should('be.visible').clear().type(password);
  cy.get('button[type="submit"]').contains(/Sign In|Authenticating/i).click();
  cy.url({ timeout: 10000 }).should('not.include', '/login');
  cy.contains('Checking authentication...', { timeout: 10000 }).should('not.exist');
});

Cypress.Commands.add('loginProgrammatically', (userObj: any) => {
  window.localStorage.setItem('auth_user', JSON.stringify(userObj));
  window.localStorage.setItem('auth_token', 'cookie_managed');
});

export {};
