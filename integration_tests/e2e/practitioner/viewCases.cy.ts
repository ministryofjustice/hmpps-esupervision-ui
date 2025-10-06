import Page from '../../pages/page'
import CasesPage from '../../pages/practitioner/cases/casesPage'
import DashboardPage from '../../pages/practitioner/cases/dashboardPage'

describe('View cases', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: [''] })
    cy.task('stubOffenders')
    cy.task('stubOffenderCheckins')
    cy.signIn({ failOnStatusCode: false })
  })

  describe('When viewing the Active cases tab', () => {
    it('should display a table of active cases', () => {
      const dashboardPage = Page.verifyOnPage(DashboardPage)
      dashboardPage.casesTab().click()
      const casesPage = Page.verifyOnPage(CasesPage)
      casesPage.casesTable().should('be.visible')
      casesPage.casesTable().contains('th', 'Next check in').should('be.visible')
    })
  })

  describe('When viewing the Stopped cases tab', () => {
    it('should display a table when there are stopped cases', () => {
      const dashboardPage = Page.verifyOnPage(DashboardPage)
      dashboardPage.casesTab().click()
      const casesPage = Page.verifyOnPage(CasesPage)
      casesPage.stoppedTab().click()
      casesPage.casesTable().should('be.visible')
    })
  })
})
