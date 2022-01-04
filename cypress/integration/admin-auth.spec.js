/// <reference types="cypress" />

describe('admin authentication', () => {
  beforeEach(() => {
    cy.visit('http://localhost:7200/admin');
  });

  it('display the default landing', () => {
    cy.get('.test--email-address').should('exist');
  });

  it('fail the sign in', () => {
    cy.get('.test--email-address').type('demo@artgen.io');
    cy.get('.test--password').type('demoX');
    cy.get('.test--sign-in').click();

    // Stays on the sign in page
    cy.get('.test--sign-in').should('exist');
  });

  it('pass the sign in', () => {
    cy.get('.test--email-address').type('demo@artgen.io');
    cy.get('.test--password').type('demo');
    cy.get('.test--sign-in').click();

    // Sign out
    cy.get('.test--sign-out').should('exist').click();
    cy.get('.test--email-address').should('exist');
  });
});
