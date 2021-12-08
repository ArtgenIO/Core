/// <reference types="cypress" />

describe('Database Manager', () => {
  before(() => {
    cy.login();

    cy.visit('http://localhost:7200/admin/database');
  });

  it('should list the main database', () => {
    cy.get('.test--db-name').should('contain.text', 'Main');
  });

  it('should show a connect button', () => {
    cy.get('.test--connect-btn').should('exist');
  });

  it('should connect a new database', () => {
    cy.get('.test--connect-btn').click();

    cy.get('.test--db-title').should('exist').type('Test Cypress');
    cy.get('.test--db-name').should('exist').type('testmem');
    cy.get('.test--db-dsn').should('exist').type('sqlite:./test-cy.db');
    cy.get('.test--connect-sub').should('exist').click();

    cy.get('.test--connected').should('exist');
    cy.get('.test--db-name').should('contain.text', 'Test Cypress');
  });

  it('should delete the new database', () => {
    // See the delete button
    cy.get('[data-db-delete="testmem"]').should('exist').click();

    // Click the popup confirm
    cy.get('.ant-popover-buttons .ant-btn.ant-btn-primary.ant-btn-sm')
      .should('exist')
      .should('contain.text', 'Yes, delete it')
      .click();

    // See the notification
    cy.get('.test--db-deleted-not').should('exist');
    // List item removed
    cy.get('[data-db-delete="testmem"]').should('not.exist');
  });
});
