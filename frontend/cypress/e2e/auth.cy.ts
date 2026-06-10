/// <reference types="cypress" />

describe('Authentication', () => {
  const testUser = {
    email: `test-${Date.now()}@carbonwise.ai`,
    name: 'Test User',
    password: 'TestPass123',
  };

  describe('Registration', () => {
    beforeEach(() => {
      cy.visit('/register');
    });

    it('shows registration form with all required fields', () => {
      cy.findByRole('heading', { name: /create your account/i }).should('be.visible');
      cy.findByLabelText(/full name/i).should('be.visible');
      cy.findByLabelText(/email address/i).should('be.visible');
      cy.findByLabelText(/^password/i).should('be.visible');
      cy.findByLabelText(/confirm password/i).should('be.visible');
    });

    it('validates required fields', () => {
      cy.findByRole('button', { name: /create account/i }).click();
      cy.findByRole('alert').should('exist');
    });

    it('validates password strength requirements', () => {
      cy.findByLabelText(/^password/i).type('weak');
      cy.findByRole('list', { name: /password requirements/i })
        .findAllByRole('listitem')
        .should('exist');
    });

    it('validates email format', () => {
      cy.findByLabelText(/email address/i).type('not-an-email');
      cy.findByLabelText(/full name/i).click();
      cy.contains(/valid email/i).should('be.visible');
    });

    it('shows error when passwords do not match', () => {
      cy.findByLabelText(/^password/i).type('TestPass123');
      cy.findByLabelText(/confirm password/i).type('DifferentPass123');
      cy.findByRole('button', { name: /create account/i }).click();
      cy.contains(/do not match/i).should('be.visible');
    });

    it('successfully registers a new user', () => {
      cy.findByLabelText(/full name/i).type(testUser.name);
      cy.findByLabelText(/email address/i).type(testUser.email);
      cy.findByLabelText(/^password/i).type(testUser.password);
      cy.findByLabelText(/confirm password/i).type(testUser.password);
      cy.findByRole('button', { name: /create account/i }).click();
      cy.url().should('include', '/dashboard');
    });

    it('has accessible form elements with proper labels', () => {
      cy.injectAxe?.();
      cy.checkA11y?.('form');
    });
  });

  describe('Login', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('renders login form', () => {
      cy.findByRole('heading', { name: /welcome back/i }).should('be.visible');
      cy.findByLabelText(/email/i).should('be.visible');
      cy.findByLabelText(/password/i).should('be.visible');
    });

    it('shows error for invalid credentials', () => {
      cy.findByLabelText(/email/i).type('wrong@example.com');
      cy.findByLabelText(/password/i).type('WrongPassword1');
      cy.findByRole('button', { name: /sign in/i }).click();
      cy.findByRole('alert').should('be.visible');
    });

    it('redirects to dashboard on successful login', () => {
      cy.findByLabelText(/email/i).type(Cypress.env('testUser').email);
      cy.findByLabelText(/password/i).type(Cypress.env('testUser').password);
      cy.findByRole('button', { name: /sign in/i }).click();
      cy.url().should('include', '/dashboard');
    });

    it('has forgot password link', () => {
      cy.findByRole('link', { name: /forgot password/i }).should('have.attr', 'href', '/forgot-password');
    });

    it('can toggle password visibility', () => {
      cy.findByLabelText(/password/i).type('secret');
      cy.findByRole('button', { name: /show password/i }).click();
      cy.findByLabelText(/password/i).should('have.attr', 'type', 'text');
      cy.findByRole('button', { name: /hide password/i }).click();
      cy.findByLabelText(/password/i).should('have.attr', 'type', 'password');
    });
  });

  describe('Protected Routes', () => {
    it('redirects unauthenticated users to login', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
    });

    it('redirects authenticated users away from login', () => {
      cy.login();
      cy.visit('/login');
      cy.url().should('include', '/dashboard');
    });
  });
});
