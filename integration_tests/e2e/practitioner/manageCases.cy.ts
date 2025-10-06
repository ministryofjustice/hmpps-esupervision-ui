import { createMockOffender } from '../../mockApis/esupervisionApi'
import Page from '../../pages/page'
import ManageCasePage from '../../pages/practitioner/cases/manageCasePage'

describe('Manage Case Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: [''] })
    cy.signIn({ failOnStatusCode: false })
  })

  it('should display the correct details when visiting a case page directly', () => {
    const testOffender = createMockOffender()
    cy.task('stubGetOffender', testOffender)
    cy.visit(`/practitioners/cases/${testOffender.uuid}`)
    const manageCasePage = Page.verifyOnPage(ManageCasePage)
    manageCasePage.verifySummaryValue('First name', testOffender.firstName)
    manageCasePage.verifySummaryValue('Last name', testOffender.lastName)
    manageCasePage.verifySummaryValue('Case reference number (CRN)', testOffender.crn)
  })
})
