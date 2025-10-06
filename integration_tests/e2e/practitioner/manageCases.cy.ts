import { createMockOffender } from '../../mockApis/esupervisionApi'
import Page from '../../pages/page'
import ManageCasePage from '../../pages/practitioner/cases/manageCasePage'
import UpdatePersonalDetailsPage from '../../pages/practitioner/cases/update/personalDetailsPage'
import ContactPreferencePage from '../../pages/practitioner/register/contact/contactPreferencePage'

describe('Manage Case Page', () => {
  let testOffender

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: [''] })
    cy.signIn({ failOnStatusCode: false })
    testOffender = createMockOffender({ status: 'VERIFIED' })
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
})
