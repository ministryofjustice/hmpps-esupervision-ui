import { faker } from '@faker-js/faker'
import { addDays, format } from 'date-fns'
import Page from '../../pages/page'
import DashboardPage from '../../pages/practitioner/cases/dashboardPage'
import CheckYourAnswersPage from '../../pages/practitioner/register/checkAnswersPage'
import ContactPreferencePage from '../../pages/practitioner/register/contact/contactPreferencePage'
import EnterEmailPage from '../../pages/practitioner/register/contact/emailPage'
import EnterMobilePage from '../../pages/practitioner/register/contact/mobilePage'
import EnterPersonalDetailsPage from '../../pages/practitioner/register/enterPersonalDetailsPage'
import ReviewPhotoPage from '../../pages/practitioner/register/photo/reviewPhotoPage'
import TakePhotoPage from '../../pages/practitioner/register/photo/takePhotoPage'
import UploadPhotoPage from '../../pages/practitioner/register/photo/uploadPhotoPage'
import SetUpCheckInPage from '../../pages/practitioner/register/setupOnlineCheckinsPage'
import { generateValidUKMobileNumber, generateValidCrn } from '../../support/utils'

describe('Register person', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: [''] })
    cy.task('stubOffenders')
    cy.task('stubOffenderCheckins')
    cy.task('stubVerifyToken')
    cy.task('stubCreateOffender')
    cy.task('stubOffenderContactCheck')
    cy.task('stubGetProfilePhotoUploadLocation')
    cy.task('stubFakeS3Upload')
    cy.task('stubCompleteOffenderSetup')
    cy.signIn({ failOnStatusCode: false })
    Page.verifyOnPage(DashboardPage)
  })

  it('should allow a practitioner to register a person using the camera and selecting email contact', () => {
    cy.contains('Add person').click()
    const enterPersonalDetailsPage = Page.verifyOnPage(EnterPersonalDetailsPage)

    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const email = faker.internet.email()
    enterPersonalDetailsPage.completeForm({
      firstName,
      lastName,
      day: '1',
      month: '1',
      year: '1970',
      crn: generateValidCrn(),
    })
    enterPersonalDetailsPage.continueButton().click()

    const takePhotoPage = Page.verifyOnPage(TakePhotoPage)
    takePhotoPage.takePhotoButton().click()

    const reviewPhotoPage = Page.verifyOnPage(ReviewPhotoPage)
    reviewPhotoPage.continueButton().click()

    const contactPreferencePage = Page.verifyOnPage(ContactPreferencePage)
    contactPreferencePage.selectEmail()
    contactPreferencePage.continueButton().click()

    const enterEmailPage = Page.verifyOnPage(EnterEmailPage)
    enterEmailPage.enterEmail(email)
    enterEmailPage.continueButton().click()

    const setUpCheckInPage = Page.verifyOnPage(SetUpCheckInPage)
    setUpCheckInPage.enterStartDate(format(addDays(new Date(), 7), 'dd/MM/yyyy'))
    setUpCheckInPage.selectFrequency('TWO_WEEKS')
    setUpCheckInPage.continueButton().click()

    const checkYourAnswersPage = Page.verifyOnPage(CheckYourAnswersPage)
    checkYourAnswersPage.confirmButton().click()

    const dashboardPage = Page.verifyOnPage(DashboardPage)
    dashboardPage
      .successBannerTitle()
      .should('contain.text', `${firstName} ${lastName} has been set up to check in online`)
    dashboardPage.successBannerMessage().should('contain.text', `We have sent a confirmation to ${email}`)
  })

  it('should allow a practitioner to register a person by uploading a photo and selecting text contact', () => {
    cy.contains('Add person').click()
    const enterPersonalDetailsPage = Page.verifyOnPage(EnterPersonalDetailsPage)

    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const mobile = generateValidUKMobileNumber()
    enterPersonalDetailsPage.completeForm({
      firstName,
      lastName,
      day: '02',
      month: '2',
      year: '1980',
      crn: generateValidCrn(),
    })
    enterPersonalDetailsPage.continueButton().click()

    const takePhotoPage = Page.verifyOnPage(TakePhotoPage)
    takePhotoPage.uploadInsteadLink().click()
    const uploadPhotoPage = Page.verifyOnPage(UploadPhotoPage)
    uploadPhotoPage.uploadPhoto('person.jpg')
    uploadPhotoPage.uploadPhotoButton().click()

    const reviewPhotoPage = Page.verifyOnPage(ReviewPhotoPage)
    reviewPhotoPage.continueButton().click()

    const contactPreferencePage = Page.verifyOnPage(ContactPreferencePage)
    contactPreferencePage.selectText()
    contactPreferencePage.continueButton().click()

    const enterMobilePage = Page.verifyOnPage(EnterMobilePage)
    enterMobilePage.enterMobile(mobile)
    enterMobilePage.continueButton().click()

    const setUpCheckInPage = Page.verifyOnPage(SetUpCheckInPage)
    setUpCheckInPage.enterStartDate(format(addDays(new Date(), 7), 'dd/MM/yyyy'))
    setUpCheckInPage.selectFrequency('WEEKLY')
    setUpCheckInPage.continueButton().click()

    const checkYourAnswersPage = Page.verifyOnPage(CheckYourAnswersPage)
    checkYourAnswersPage.verifySummaryValue('First name', firstName)
    checkYourAnswersPage.verifySummaryValue('Mobile number', mobile)
    checkYourAnswersPage.verifySummaryValue('How often', 'Every week')
    checkYourAnswersPage.confirmButton().click()

    const dashboardPage = Page.verifyOnPage(DashboardPage)
    dashboardPage
      .successBannerTitle()
      .should('contain.text', `${firstName} ${lastName} has been set up to check in online`)
    dashboardPage.successBannerMessage().should('contain.text', `We have sent a confirmation to ${mobile}`)
  })
})
