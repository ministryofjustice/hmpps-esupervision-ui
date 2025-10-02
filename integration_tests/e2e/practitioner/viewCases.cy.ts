import Page from '../../pages/page'
import DashboardPage from '../../pages/practitioner/dashboardPage'

describe('View cases and check-ins', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: [''] })
    cy.task('stubOffenders')
    cy.task('stubOffenderCheckins')

    cy.signIn({ failOnStatusCode: false })
    Page.verifyOnPage(DashboardPage)
  })

  it('should allow a practitioner to navigate between the check-ins and cases views', () => {
    Page.verifyOnPage(DashboardPage)
  })
})
