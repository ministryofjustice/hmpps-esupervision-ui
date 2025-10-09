import Page from '../../pages/page'
import DashboardPage from '../../pages/practitioner/cases/dashboardPage'

describe('View check-ins', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: [''] })
    cy.task('stubOffenders')
    cy.task('stubOffenderCheckins')

    cy.signIn({ failOnStatusCode: false })
    Page.verifyOnPage(DashboardPage)
  })

  describe('When viewing the checkins tab', () => {
    it('should display a table of checkins', () => {
      const checkinPage = Page.verifyOnPage(DashboardPage)
      checkinPage.checkInsTable().should('be.visible')
      checkinPage.checkInsTable().should('be.visible')
    })
  })

  describe('When viewing the Needs Attention tab', () => {
    it('should display a table when there are needs attention checkins', () => {
      const checkinPage = Page.verifyOnPage(DashboardPage)
      checkinPage.needsAttentionFilter().click()
      checkinPage.checkInsTable().contains('th', 'Review due').should('be.visible')
    })
  })
  describe('When viewing the Reviewed tab', () => {
    it('should display a table when there are reviewed checkins', () => {
      const checkinPage = Page.verifyOnPage(DashboardPage)
      checkinPage.reviewedFilter().click()
      checkinPage.checkInsTable().contains('th', 'Reviewed').should('be.visible')
    })
  })
  describe('When viewing the Awaiting check in tab', () => {
    it('should display a table when there are awaiting checkins', () => {
      const checkinPage = Page.verifyOnPage(DashboardPage)
      checkinPage.awaitingCheckInFilter().click()
      checkinPage.checkInsTable().contains('th', 'Link sent to').should('be.visible')
    })
  })
})
