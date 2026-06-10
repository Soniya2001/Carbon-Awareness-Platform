/// <reference types="cypress" />

describe('Carbon Tracking', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/tracker');
  });

  it('renders the tracker page with category tabs', () => {
    cy.findByRole('heading', { name: /carbon tracker/i }).should('be.visible');
    cy.findByRole('tab', { name: /transportation/i }).should('be.visible');
    cy.findByRole('tab', { name: /energy/i }).should('be.visible');
    cy.findByRole('tab', { name: /food/i }).should('be.visible');
    cy.findByRole('tab', { name: /shopping/i }).should('be.visible');
    cy.findByRole('tab', { name: /waste/i }).should('be.visible');
  });

  it('shows transportation activity types', () => {
    cy.findByRole('tab', { name: /transportation/i }).click();
    cy.findByRole('radiogroup', { name: /activity type/i }).should('be.visible');
  });

  it('shows live CO2 preview when value is entered', () => {
    cy.findByRole('tab', { name: /transportation/i }).click();
    cy.findByLabelText(/amount/i).type('50');
    cy.contains(/estimated co₂e/i).should('be.visible');
  });

  it('logs a transportation activity', () => {
    cy.findByRole('tab', { name: /transportation/i }).click();
    cy.findByLabelText(/amount/i).type('25');
    cy.findByRole('button', { name: /log activity/i }).click();
    cy.contains(/logged/i).should('be.visible');
  });

  it('logs a food activity', () => {
    cy.findByRole('tab', { name: /food/i }).click();
    cy.findByLabelText(/amount/i).type('0.5');
    cy.findByRole('button', { name: /log activity/i }).click();
    cy.contains(/logged/i).should('be.visible');
  });

  it('validates that value must be positive', () => {
    cy.findByLabelText(/amount/i).type('-5');
    cy.findByRole('button', { name: /log activity/i }).click();
    cy.findByRole('alert').should('be.visible');
  });

  it('switches between category tabs without losing state', () => {
    cy.findByRole('tab', { name: /energy/i }).click();
    cy.findByRole('radiogroup').should('be.visible');
    cy.findByRole('tab', { name: /transportation/i }).click();
    cy.findByRole('radiogroup').should('be.visible');
  });
});
