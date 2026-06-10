/// <reference types="cypress" />

describe('Carbon Twin AI', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/carbon-twin');
  });

  it('renders the Carbon Twin page', () => {
    cy.findByRole('heading', { name: /carbon twin/i }).should('be.visible');
    cy.contains(/simulate your future/i).should('be.visible');
  });

  it('shows all simulation scenarios', () => {
    cy.contains(/public transport/i).should('be.visible');
    cy.contains(/plant-based/i).should('be.visible');
    cy.contains(/renewable energy/i).should('be.visible');
    cy.contains(/work from home/i).should('be.visible');
  });

  it('allows scenario selection', () => {
    cy.findByRole('button', { name: /select scenario: plant-based diet/i }).click();
    cy.findByRole('button', { name: /select scenario: plant-based diet/i })
      .should('have.attr', 'aria-pressed', 'true');
  });

  it('allows projection year selection', () => {
    cy.findByRole('group', { name: /projection years/i }).within(() => {
      cy.findByRole('button', { name: '3yr' }).click();
      cy.findByRole('button', { name: '3yr' }).should('have.attr', 'aria-pressed', 'true');
    });
  });

  it('shows empty state before running simulation', () => {
    cy.contains(/select a scenario and run simulation/i).should('be.visible');
  });

  it('runs simulation and shows results', () => {
    cy.findByRole('button', { name: /run simulation/i }).click();
    // Wait for API response
    cy.contains(/current annual|projected annual/i, { timeout: 15000 }).should('be.visible');
  });

  it('displays impact equivalents after simulation', () => {
    cy.findByRole('button', { name: /run simulation/i }).click();
    cy.contains(/trees equivalent/i, { timeout: 15000 }).should('be.visible');
    cy.contains(/money saved/i).should('be.visible');
  });

  it('each scenario has a potential saving badge', () => {
    cy.contains(/save \d+-\d+%/i).should('exist');
  });
});
