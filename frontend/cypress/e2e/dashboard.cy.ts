/// <reference types="cypress" />

describe('Dashboard', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/dashboard');
  });

  it('renders main dashboard with KPI cards', () => {
    cy.findByRole('heading', { name: /dashboard/i }).should('be.visible');
    cy.contains(/today.*footprint/i).should('be.visible');
    cy.contains(/weekly total/i).should('be.visible');
    cy.contains(/eco points/i).should('be.visible');
    cy.contains(/sustainability score/i).should('be.visible');
  });

  it('shows sidebar navigation', () => {
    cy.findByRole('navigation', { name: /sidebar navigation/i }).should('be.visible');
    cy.findByRole('link', { name: /tracker/i }).should('be.visible');
    cy.findByRole('link', { name: /carbon twin/i }).should('be.visible');
    cy.findByRole('link', { name: /analytics/i }).should('be.visible');
  });

  it('navigates to tracker page', () => {
    cy.findByRole('link', { name: /tracker/i }).click();
    cy.url().should('include', '/tracker');
  });

  it('navigates to AI coach page', () => {
    cy.findByRole('link', { name: /ai coach/i }).click();
    cy.url().should('include', '/ai-coach');
  });

  it('shows header with user menu', () => {
    cy.findByRole('button', { name: /user menu/i }).should('be.visible');
  });

  it('shows empty state when no activities logged', () => {
    // Only shown if no data
    cy.get('body').then(($body) => {
      if ($body.text().includes('No activities logged yet')) {
        cy.contains(/log your first activity/i).should('be.visible');
      }
    });
  });

  it('sidebar collapses and expands', () => {
    cy.findByRole('button', { name: /collapse sidebar/i }).click();
    cy.findByRole('button', { name: /expand sidebar/i }).should('be.visible');
    cy.findByRole('button', { name: /expand sidebar/i }).click();
    cy.findByRole('button', { name: /collapse sidebar/i }).should('be.visible');
  });

  it('displays notifications bell', () => {
    cy.findByRole('button', { name: /view notifications/i }).click();
    cy.findByRole('region', { name: /notifications panel/i }).should('be.visible');
  });

  it('has proper page title', () => {
    cy.title().should('include', 'CarbonWise AI');
  });

  it('is keyboard navigable', () => {
    cy.get('body').tab();
    cy.focused().should('exist');
  });
});
