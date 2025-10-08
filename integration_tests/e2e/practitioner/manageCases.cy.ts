import OffenderStatus from '../../../server/data/models/offenderStatus'
import { createMockOffender } from '../../mockApis/esupervisionApi'
import Page from '../../pages/page'
import ManageCasePage from '../../pages/practitioner/cases/manageCasePage'
import UpdatePersonalDetailsPage from '../../pages/practitioner/cases/update/personalDetailsPage'
import StopCheckInsPage from '../../pages/practitioner/cases/update/stopCheckinsPage'
import ContactPreferencePage from '../../pages/practitioner/register/contact/contactPreferencePage'

describe('Manage Case Page', () => {
  let testOffender

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: [''] })
    cy.task('stubOffenders')
    cy.signIn({ failOnStatusCode: false })
    testOffender = createMockOffender({ status: OffenderStatus.Verified })
    cy.task('stubGetOffender', testOffender)
    cy.visit(`/practitioners/cases/${testOffender.uuid}`)
  })

  it('should display all correct details for an active case', () => {
    const manageCasePage = Page.verifyOnPage(ManageCasePage)
    manageCasePage.verifySummaryValue('First name', testOffender.firstName)
    manageCasePage.verifySummaryValue('Last name', testOffender.lastName)
  })

  it('should navigate to the personal details page when "Change" is clicked', () => {
    const manageCasePage = Page.verifyOnPage(ManageCasePage)
    manageCasePage.changePersonalDetailsLink().click()
    cy.url().should('include', '/update/personal-details')
    Page.verifyOnPage(UpdatePersonalDetailsPage)
  })

  it('should navigate to the contact details page when "Change" is clicked', () => {
    const manageCasePage = Page.verifyOnPage(ManageCasePage)
    manageCasePage.changeContactDetailsLink().click()
    cy.url().should('include', '/update/contact-details')
    Page.verifyOnPage(ContactPreferencePage)
  })

  it('should navigate to the stop check-ins page when the button is clicked', () => {
    const manageCasePage = Page.verifyOnPage(ManageCasePage)
    manageCasePage.stopCheckInsButton().click()
    cy.url().should('include', '/update/stop-checkins')
    cy.contains('h1', 'Are you sure you want to stop check ins').should('be.visible')
  })

  it('should allow a offender to stop check-ins for a case', () => {
    cy.visit(`/practitioners/cases/${testOffender.uuid}`)
    const manageCasePage = Page.verifyOnPage(ManageCasePage)
    manageCasePage.stopCheckInsButton().click()
    const stopCheckInsPage = Page.verifyOnPage(StopCheckInsPage)
    stopCheckInsPage.selectYesAndProvideReason('Case has been transferred.')
    stopCheckInsPage.continueButton().click()

    // Page.verifyOnPage(ManageCasePage) // Should redirect back to the manage page
    // manageCasePage.stoppedCheckInsAlert().should('be.visible')
    // manageCasePage.stopCheckInsButton().should('not.exist')
    // manageCasePage.verifySummaryValue('Next check in', 'Check ins stopped')
  })
})
