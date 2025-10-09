import { faker } from '@faker-js/faker'
import OffenderStatus from '../../../server/data/models/offenderStatus'
import { createMockOffender } from '../../mockApis/esupervisionApi'
import Page from '../../pages/page'
import ManageCasePage from '../../pages/practitioner/cases/manageCasePage'
import UpdateCheckInSettingsPage from '../../pages/practitioner/cases/update/updateCheckinSettingsPage'
import UpdatePersonalDetailsPage from '../../pages/practitioner/cases/update/personalDetailsPage'
import StopCheckInsPage from '../../pages/practitioner/cases/update/stopCheckinsPage'
import Offender from '../../../server/data/models/offender'

const frequencyMap = {
  WEEKLY: 'Every week',
  TWO_WEEKS: 'Every 2 weeks',
  FOUR_WEEKS: 'Every 4 weeks',
  EIGHT_WEEKS: 'Every 8 weeks',
}

describe('Manage Case Page', () => {
  let testOffender: Offender

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: [''] })
    cy.task('stubVerifyToken')
    cy.signIn({ failOnStatusCode: false })
    testOffender = createMockOffender({ status: OffenderStatus.Verified })
    cy.task('stubGetOffender', testOffender)
    cy.task('stubOffenderCheckins')
    cy.task('stubUpdateOffender', testOffender)
    cy.task('stubUpdateCheckinSettings', testOffender)
    cy.task('stubStopCheckins', testOffender)
    cy.visit(`/practitioners/cases/${testOffender.uuid}`)
  })

  it('should display all correct details for an active case', () => {
    const manageCasePage = Page.verifyOnPage(ManageCasePage)
    manageCasePage.verifySummaryValue('First name', testOffender.firstName)
    manageCasePage.verifySummaryValue('Last name', testOffender.lastName)
  })

  it('should allow a practitioner to update personal details', () => {
    const newFirstName = faker.person.firstName()
    const updatedOffender = { ...testOffender, firstName: newFirstName }
    cy.task('stubUpdateOffender', updatedOffender)
    cy.task('stubGetOffender', updatedOffender)
    const manageCasePage = Page.verifyOnPage(ManageCasePage)
    manageCasePage.changePersonalDetailsLink().click()

    const updatePage = Page.verifyOnPage(UpdatePersonalDetailsPage)
    updatePage.firstNameField().clear().type(newFirstName)
    updatePage.saveChangesButton().click()
    Page.verifyOnPage(ManageCasePage)
    manageCasePage.verifySummaryValue('First name', newFirstName)
  })

  it('should allow a practitioner to update check-in settings', () => {
    const newFrequency = 'FOUR_WEEKS'
    const updatedOffender = { ...testOffender, checkinInterval: newFrequency }
    cy.task('stubUpdateCheckinSettings', updatedOffender)
    cy.task('stubGetOffender', updatedOffender)

    const manageCasePage = Page.verifyOnPage(ManageCasePage)
    manageCasePage.changeCheckInSettingsLink().click()

    const updatePage = Page.verifyOnPage(UpdateCheckInSettingsPage)
    updatePage.selectFrequency(newFrequency)
    updatePage.saveChangesButton().click()
    Page.verifyOnPage(ManageCasePage)
    manageCasePage.verifySummaryValue('Frequency', frequencyMap[newFrequency])
  })

  it('should allow a practitioner to stop check-ins for a case', () => {
    const stoppedOffender = { ...testOffender, status: OffenderStatus.Inactive }
    cy.task('stubGetOffender', stoppedOffender)

    const manageCasePage = Page.verifyOnPage(ManageCasePage)
    manageCasePage.stopCheckInsButton().click()

    const stopPage = Page.verifyOnPage(StopCheckInsPage)
    const reason = 'Case has been transferred.'
    stopPage.selectYesAndProvideReason(reason)
    stopPage.continueButton().click()

    Page.verifyOnPage(ManageCasePage)
    manageCasePage.stopCheckInsButton().should('not.exist')
    manageCasePage.verifySummaryValue('Next check in', 'Check ins stopped')
  })
})
