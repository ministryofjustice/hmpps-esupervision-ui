import { faker } from '@faker-js/faker'
import { addDays, format } from 'date-fns'
import OffenderStatus from '../../../server/data/models/offenderStatus'
import { createMockCheckin, createMockOffender } from '../../mockApis/esupervisionApi'
import Page from '../../pages/page'
import ManageCasePage from '../../pages/practitioner/cases/manageCasePage'
import UpdateCheckInSettingsPage from '../../pages/practitioner/cases/update/updateCheckinSettingsPage'
import UpdatePersonalDetailsPage from '../../pages/practitioner/cases/update/personalDetailsPage'
import StopCheckInsPage from '../../pages/practitioner/cases/update/stopCheckinsPage'
import Offender from '../../../server/data/models/offender'
import Checkin from '../../../server/data/models/checkin'
import CheckinStatus from '../../../server/data/models/checkinStatus'

const frequencyMap = {
  WEEKLY: 'Every week',
  TWO_WEEKS: 'Every 2 weeks',
  FOUR_WEEKS: 'Every 4 weeks',
  EIGHT_WEEKS: 'Every 8 weeks',
}

describe('Manage Case Page', () => {
  let testOffender: Offender
  let testCheckin: Checkin

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: [''] })
    cy.task('stubVerifyToken')
    cy.signIn({ failOnStatusCode: false })
    testOffender = createMockOffender({ status: OffenderStatus.Verified })
    testCheckin = createMockCheckin(testOffender, {
      status: CheckinStatus.Created,
      dueDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    })
    cy.task('stubGetOffender', testOffender)
    cy.task('stubOffenderCheckins')
    cy.task('stubGetCheckinsForOffender', { offender: testOffender, checkins: [testCheckin] })
    cy.task('stubResendCheckinInvite', testCheckin)
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
  it('should show and allow resending the check-in link', () => {
    const manageCasePage = Page.verifyOnPage(ManageCasePage)
    manageCasePage.resendCheckinLink().should('be.visible').and('contain.text', 'Resend check in link')
    manageCasePage.resendCheckinLink().click()
    Page.verifyOnPage(ManageCasePage)
    cy.url().should('include', `/practitioners/cases/${testOffender.uuid}`)
    const contact = testOffender.email || testOffender.phoneNumber
    manageCasePage.successMessageBody().should('contain.html', `<strong>Link has been sent to ${contact}</strong>`)
  })

  it('should not show resend link if check-in is not in CREATED state', () => {
    const submittedCheckin = createMockCheckin(testOffender, {
      status: CheckinStatus.Submitted,
    })
    cy.task('stubGetCheckinsForOffender', { offender: testOffender, checkins: [submittedCheckin] })

    cy.visit(`/practitioners/cases/${testOffender.uuid}`)
    const manageCasePage = Page.verifyOnPage(ManageCasePage)

    manageCasePage.resendCheckinLink().should('not.exist')
  })

  it('should not show resend link if check-in is expired', () => {
    const expiredCheckin = createMockCheckin(testOffender, {
      status: CheckinStatus.Created,
      dueDate: format(addDays(new Date(), -5), 'yyyy-MM-dd'),
    })
    cy.task('stubGetCheckinsForOffender', { offender: testOffender, checkins: [expiredCheckin] })
    cy.visit(`/practitioners/cases/${testOffender.uuid}`)
    const manageCasePage = Page.verifyOnPage(ManageCasePage)
    manageCasePage.resendCheckinLink().should('not.exist')
  })
})
