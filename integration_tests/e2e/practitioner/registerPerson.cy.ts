import DashboardPage from '../../pages/practitioner/dashboardPage'
import Page from '../../pages/page'
import CheckYourAnswersPage from '../../pages/practitioner/register/checkAnswersPage'
import ContactPreferencePage from '../../pages/practitioner/register/contact/contactPreferencePage'
import EnterEmailPage from '../../pages/practitioner/register/contact/emailPage'
import EnterMobilePage from '../../pages/practitioner/register/contact/mobilePage'
import EnterPersonalDetailsPage from '../../pages/practitioner/register/enterPersonalDetailsPage'
import ReviewPhotoPage from '../../pages/practitioner/register/photo/reviewPhotoPage'
import TakePhotoPage from '../../pages/practitioner/register/photo/takePhotoPage'
import UploadPhotoPage from '../../pages/practitioner/register/photo/uploadPhotoPage'
import SetUpCheckInPage from '../../pages/practitioner/register/setupOnlineCheckinsPage'
import generateValidCrn from '../../support/utils'

describe('Register person', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: [''] })
    cy.task('stubOffenders')
    cy.task('stubOffenderCheckins')
    cy.signIn({ failOnStatusCode: false })
    Page.verifyOnPage(DashboardPage)
  })

  it('should allow a practitioner to register a person using the camera and selecting email contact', () => {
    cy.contains('Add person').click()
    const enterPersonalDetailsPage = Page.verifyOnPage(EnterPersonalDetailsPage)

    // Fill Personal Details
    const firstName = 'Bilbo'
    const lastName = 'Baggins'
    const email = 'bilbo.baggins@theshire.com'
    enterPersonalDetailsPage.completeForm({
      firstName,
      lastName,
      day: '22',
      month: '9',
      year: '1920',
      crn: generateValidCrn(),
    })
    enterPersonalDetailsPage.continueButton().click()

    // Take Photo
    const takePhotoPage = Page.verifyOnPage(TakePhotoPage)
    takePhotoPage.takePhotoButton().click()

    // Review Photo
    const reviewPhotoPage = Page.verifyOnPage(ReviewPhotoPage)
    reviewPhotoPage.continueButton().click()

    // Contact Preference
    const contactPreferencePage = Page.verifyOnPage(ContactPreferencePage)
    contactPreferencePage.selectEmail()
    contactPreferencePage.continueButton().click()

    // Enter Email
    const enterEmailPage = Page.verifyOnPage(EnterEmailPage)
    enterEmailPage.enterEmail(email)
    enterEmailPage.continueButton().click()

    // Set Up Check-in
    const setUpCheckInPage = Page.verifyOnPage(SetUpCheckInPage)
    setUpCheckInPage.enterStartDate('11/10/2025')
    setUpCheckInPage.selectFrequency('TWO_WEEKS')
    setUpCheckInPage.continueButton().click()

    // Check Answers
    const checkYourAnswersPage = Page.verifyOnPage(CheckYourAnswersPage)
    checkYourAnswersPage.confirmButton().click()

    // Success on dashboard page
    // const dashboardPage = Page.verifyOnPage(DashboardPage)
    // dashboardPage.successBannerTitle().should('contain.text', `${firstName} ${lastName} has been set up to check in online`)
    // dashboardPage.successBannerMessage().should('contain.text', `We have sent a confirmation to ${email}`)
  })

  it('should allow a practitioner to register a person by uploading a photo and selecting text contact', () => {
    cy.contains('Add person').click()
    const enterPersonalDetailsPage = Page.verifyOnPage(EnterPersonalDetailsPage)

    // Fill Personal Details
    const firstName = 'Samwise'
    const lastName = 'Gamgee'
    const mobile = '07700900000'
    enterPersonalDetailsPage.completeForm({
      firstName,
      lastName,
      day: '06',
      month: '04',
      year: '1980',
      crn: generateValidCrn(),
    })
    enterPersonalDetailsPage.continueButton().click()

    // Upload Photo
    const takePhotoPage = Page.verifyOnPage(TakePhotoPage)
    takePhotoPage.uploadInsteadLink().click()
    const uploadPhotoPage = Page.verifyOnPage(UploadPhotoPage)
    uploadPhotoPage.uploadPhoto('person.jpg')
    uploadPhotoPage.uploadPhotoButton().click()

    // Review Photo
    const reviewPhotoPage = Page.verifyOnPage(ReviewPhotoPage)
    reviewPhotoPage.continueButton().click()

    // Contact Preference
    const contactPreferencePage = Page.verifyOnPage(ContactPreferencePage)
    contactPreferencePage.selectText()
    contactPreferencePage.continueButton().click()

    // Enter Mobile
    const enterMobilePage = Page.verifyOnPage(EnterMobilePage)
    enterMobilePage.enterMobile(mobile)
    enterMobilePage.continueButton().click()

    // Set Up Check-in
    const setUpCheckInPage = Page.verifyOnPage(SetUpCheckInPage)
    setUpCheckInPage.enterStartDate('11/10/2025')
    setUpCheckInPage.selectFrequency('WEEKLY')
    setUpCheckInPage.continueButton().click()

    // Check Answers
    const checkYourAnswersPage = Page.verifyOnPage(CheckYourAnswersPage)
    checkYourAnswersPage.verifySummaryValue('First name', firstName)
    checkYourAnswersPage.verifySummaryValue('Mobile number', mobile)
    checkYourAnswersPage.verifySummaryValue('How often', 'Every week')
    checkYourAnswersPage.confirmButton().click()

    // Success on dashboard page
    // const dashboardPage = Page.verifyOnPage(DashboardPage)
    // dashboardPage.successBannerTitle().should('contain.text', `${firstName} ${lastName} has been set up to check in online`)
    // dashboardPage.successBannerMessage().should('contain.text', `We have sent a confirmation to ${mobile}`)
  })
})
