import Error404Page from '../pages/error404Page'
import Page from '../pages/page'

context('Not found page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: [''] })
    cy.task('stubOffenders')
    cy.task('stubOffenderCheckins')
    cy.signIn({ failOnStatusCode: false })
  })

  it('shows the 404 not found page when visiting a non-existent URL', () => {
    cy.visit('/a-fake-url-that-does-not-exist', { failOnStatusCode: false })
    Page.verifyOnPage(Error404Page)
  })
})
