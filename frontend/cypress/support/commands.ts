/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      seedCarbonData(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (
  email = Cypress.env('testUser').email,
  password = Cypress.env('testUser').password
) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.findByLabelText(/email address/i).type(email);
    cy.findByLabelText(/password/i).type(password);
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.url().should('include', '/dashboard');
  });
});

Cypress.Commands.add('logout', () => {
  cy.findByRole('button', { name: /user menu/i }).click();
  cy.findByRole('button', { name: /sign out/i }).click();
  cy.url().should('include', '/login');
});

Cypress.Commands.add('seedCarbonData', () => {
  cy.request('POST', `${Cypress.env('apiUrl')}/testing/seed`, {
    userId: 'test-user',
  });
});
