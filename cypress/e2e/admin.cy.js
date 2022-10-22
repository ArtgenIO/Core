/// <reference types="cypress" />

const { nanoid } = require('nanoid');

describe('Admin', () => {
  const host = 'http://localhost:7200/admin';

  const email = nanoid(12).replace(/_/, '').toLowerCase() + '@artgen.test';
  const password = nanoid(12);

  it('should be able to sign up', () => {
    cy.visit(`${host}/sign-up`);

    cy.get('.test--auth-cover').should('exist');
    cy.get('.test--email-address').type(email, {
      delay: 3,
    });
    cy.get('.test--password').type(password, { delay: 3 });
    cy.get('.test--sign-up-btn').click();

    // Signed in
    cy.get('.test--me-button').should('exist');
  });

  it('should be able to sign off', () => {
    cy.get('.test--me-button').click();
    cy.get('.test--me-drawer').should('exist');
    cy.get('.test--sign-out').click();

    cy.get('.test--auth-cover').should('exist');
  });

  it('should be able to sign in', () => {
    cy.visit(`${host}/sign-in`);

    cy.get('.test--auth-cover').should('exist');
    cy.get('.test--email-address').type(email, { delay: 5 });
    cy.get('.test--password').type(password, { delay: 5 });
    cy.get('.test--sign-in-btn').click();

    // Signed in
    cy.get('.test--me-button').should('exist');
  });

  it.skip('should be able to rename the dashboard', () => {
    const randomName = nanoid(8);

    cy.get('.test--dashboard-title').should('exist').clear({ interval: 100 });
    cy.get('.test--dashboard-title').type(randomName, { delay: 3 }).blur();

    cy.get('.test--dashboard-tabs div.ant-tabs-tab-btn').should(
      'have.text',
      randomName,
    );
  });

  it.skip('should be able to visit the content editor', () => {
    cy.get('.test--nav-content').should('exist');

    cy.get('.test--nav-content').click();
    cy.get('.test--content-tree').should('exist');
    cy.get('.test--content-title').should('contain.text', 'Accounts');
  });

  it('should be able to visit the flow editor', () => {
    cy.get('.test--nav-flow').should('exist');
  });

  it('should be able to visit the database editor', () => {
    cy.get('.test--nav-database').should('exist');
  });

  it.skip('should be able to visit the page editor', () => {
    cy.get('.test--nav-page').should('exist');
  });

  it('should be able to visit the store', () => {
    cy.get('.test--nav-store').should('exist');
  });
});
