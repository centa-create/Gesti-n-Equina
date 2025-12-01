// Custom Cypress commands can be defined here
// Example: login via API and set localStorage
Cypress.Commands.add('loginApi', (username: string, password: string) => {
  // Perform API login which sets the HttpOnly refresh cookie. The client app will
  // call /api/auth/refresh on load and obtain an access token using that cookie.
  return cy.request('POST', 'http://localhost:4000/api/auth/login', { username, password }).then((resp) => {
    return resp;
  });
});
