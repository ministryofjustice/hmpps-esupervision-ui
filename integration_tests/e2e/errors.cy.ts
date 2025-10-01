import IndexPage from '../pages'
import Error404Page from '../pages/error404'
import Page from '../pages/page'

context('Error pages', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: [''] })
    cy.task('stubOffenders')
    cy.task('stubOffenderCheckins')
  })
  it('shows the 404 not found page', () => {
    cy.signIn({ failOnStatusCode: false })
    Page.verifyOnPage(IndexPage)
    cy.visit('practitioners/fake-url')
    Page.verifyOnPage(Error404Page)
    Page.verifyOnPage(Error404Page)
  })
})
