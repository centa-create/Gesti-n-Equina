describe('Auth E2E', () => {
  it('logs in via API and shows home', () => {
    cy.loginApi('admin', '1234');
    cy.visit('/home');
    cy.contains('Bienvenido').should('exist');
    cy.contains('Gestión Equina').should('exist');
  });
});
