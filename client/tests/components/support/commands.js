import { mount } from '@cypress/vue'

Cypress.Commands.add('mount', mount)

Cypress.Commands.add('getByDataTestid', (selector, options) => {
  return cy.get(`[data-testid=${selector}]`, options)
})
