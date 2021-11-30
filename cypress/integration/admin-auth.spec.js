/// <reference types="cypress" />

describe('admin authentication', () => {
  beforeEach(() => {
    cy.visit('http://localhost:7200/admin');
  });

  it('display the default landing', () => {
    cy.get('#sign-in_email').should('exist');
  });

  it('process the login', () => {
    cy.get('#sign-in_email').clear().type('demo@artgen.io');
    cy.get('#sign-in_password').clear().type('demo');

    cy.get('.js--sign-in').click();

    cy.get('.brand-logo').should('exist');

    cy.get('.js--sign-out').should('exist');
    cy.get('.js--sign-out').click();
    cy.get('#sign-in_email').should('exist');
  });
});
