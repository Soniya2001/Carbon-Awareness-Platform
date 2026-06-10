// Import custom commands
import './commands';

// Global error suppression for uncaught exceptions from app code
Cypress.on('uncaught:exception', (err) => {
  // Ignore hydration errors in tests
  if (err.message.includes('Hydration') || err.message.includes('hydration')) {
    return false;
  }
  return true;
});

// Preserve auth cookie between tests
beforeEach(() => {
  cy.getCookie('carbonwise_token').then((cookie) => {
    if (cookie) {
      cy.setCookie('carbonwise_token', cookie.value);
    }
  });
});
