import AutomatedIdVerificationResult from '../../../server/data/models/automatedIdVerificationResult'
import Checkin from '../../../server/data/models/checkin'
import CheckinStatus from '../../../server/data/models/checkinStatus'
import Offender from '../../../server/data/models/offender'
import OffenderStatus from '../../../server/data/models/offenderStatus'
import { createMockCheckin, createMockOffender } from '../../mockApis/esupervisionApi'
import AssistancePage from '../../pages/submission/assistancePage'
import CallbackPage from '../../pages/submission/callbackPage'
import CheckAnswersPage from '../../pages/submission/checkAnswersPage'
import CheckinIndexPage from '../../pages/submission/checkinIndexPage'
import ConfirmationPage from '../../pages/submission/confirmationPage'
import MentalHealthPage from '../../pages/submission/mentalHealthPage'
import PersonalDetailsPage from '../../pages/submission/personalDetailsPage'
import SubmissionPage from '../../pages/submission/submissionPage'
import VideoInformPage from '../../pages/submission/video/informPage'
import VideoRecordPage from '../../pages/submission/video/recordPage'
import VideoViewPage from '../../pages/submission/video/viewPage'

describe('Start Check-in Journey', () => {
  let testOffender: Offender
  let testCheckin: Checkin
  beforeEach(() => {
    testOffender = createMockOffender({ status: OffenderStatus.Verified })
    testCheckin = createMockCheckin(testOffender, {
      status: CheckinStatus.Created,
      autoIdCheck: AutomatedIdVerificationResult.Match,
    })

    cy.task('reset').then(() => {
      cy.task('stubAuthToken')
      cy.task('stubGetCheckin', testCheckin)
      cy.task('stubGetCheckinUploadLocation', testCheckin)
      cy.task('stubFakeS3Upload')

      cy.task('stubAutoVerifyCheckinIdentity', testCheckin)
      cy.task('stubSubmitCheckin', testCheckin)
    })
  })
  it('should allow a user to submit a checkin', () => {
    cy.visit(`/submission/${testCheckin.uuid}`)
    const submissionIndexPage = SubmissionPage.verifyOnPage(CheckinIndexPage)
    cy.contains('h1', 'Check in with your probation officer').should('be.visible')
    submissionIndexPage.startButton().should('contain.text', 'Start now')
    submissionIndexPage.startButton().click()
    const personalDetailsPage = SubmissionPage.verifyOnPage(PersonalDetailsPage)
    const { firstName } = testOffender
    const { lastName } = testOffender
    const dob = new Date(testOffender.dateOfBirth)
    const day = dob.getDate().toString()
    const month = (dob.getMonth() + 1).toString()
    const year = dob.getFullYear().toString()
    personalDetailsPage.completeForm({
      firstName,
      lastName,
      day,
      month,
      year,
    })
    personalDetailsPage.continueButton().click()
    const mentalHealthPage = SubmissionPage.verifyOnPage(MentalHealthPage)
    mentalHealthPage.veryWellRadio().should('exist')
    mentalHealthPage.wellRadio().should('exist')
    mentalHealthPage.okRadio().should('exist')
    mentalHealthPage.notGreatRadio().should('exist')
    mentalHealthPage.strugglingRadio().should('exist')
    mentalHealthPage.okRadio().click()
    mentalHealthPage.continueButton().click()
    const assistancePage = SubmissionPage.verifyOnPage(AssistancePage)
    assistancePage.selectMoney()
    assistancePage.enterMoneyReason('I am having trouble with my budgeting.')
    assistancePage.selectHousing()
    assistancePage.enterHousingReason('I need to find a new place to live.')
    assistancePage.continueButton().click()

    cy.url().should('include', '/questions/callback')
    const callbackPage = SubmissionPage.verifyOnPage(CallbackPage)
    const details = 'I would like to discuss my upcoming appointment.'
    callbackPage.selectYesAndProvideDetails(details)
    callbackPage.continueButton().click()
    const informPage = SubmissionPage.verifyOnPage(VideoInformPage)
    informPage.continueButton().should('exist')
    informPage.continueButton().click()
    const recordPage = SubmissionPage.verifyOnPage(VideoRecordPage)
    recordPage.videoElement().should('exist')
    recordPage.startRecordingButton().should('exist')
    cy.visit(`/submission/${testCheckin.uuid}/video/view`) // overriding for now, also we set AutomatedIdVerificationResult to Match when creating the checkin
    const videoViewPage = SubmissionPage.verifyOnPage(VideoViewPage)
    videoViewPage.submitAnywayButton().click()

    cy.url().should('include', '/check-your-answers')
    const checkAnswersPage = SubmissionPage.verifyOnPage(CheckAnswersPage)
    checkAnswersPage.verifySummaryValue('How are you feeling?', 'OK')
    checkAnswersPage.verifySummaryValue(
      'Tell us why you need help with money',
      'I am having trouble with my budgeting.',
    )
    checkAnswersPage.verifySummaryValue('Tell us why you need help with housing', 'I need to find a new place to live.')
    checkAnswersPage.verifySummaryValue(
      'Is there anything else you need to speak with your probation officer about?',
      'Yes',
    )
    checkAnswersPage.verifySummaryValue(
      'Tell us what you need to talk about',
      'I would like to discuss my upcoming appointment.',
    )
    checkAnswersPage.clickChangeLink('How are you feeling?')
    mentalHealthPage.wellRadio().click()
    mentalHealthPage.continueButton().click()

    SubmissionPage.verifyOnPage(CheckAnswersPage)
    checkAnswersPage.verifySummaryValue('How are you feeling?', 'Well')

    checkAnswersPage.confirmCheckbox().check()
    checkAnswersPage.completeCheckinButton().click()

    cy.url().should('include', '/confirmation')
    SubmissionPage.verifyOnPage(ConfirmationPage)
  })
})
