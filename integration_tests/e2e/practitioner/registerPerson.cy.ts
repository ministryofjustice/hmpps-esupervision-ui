import IndexPage from '../../pages'
import Page from '../../pages/page'
import RegisterPersonPage from '../../pages/practitioner/registerPerson'
import TakePhotoPage from '../../pages/practitioner/takePhoto'
import UploadPhotoPage from '../../pages/practitioner/uploadPhoto'

describe('Register person', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: [''] })
    cy.task('stubOffenders')
    cy.task('stubOffenderCheckins')
  })

  it('should navigate to the add person page when the button is clicked', () => {
    cy.signIn({ failOnStatusCode: false })
    Page.verifyOnPage(IndexPage)
    cy.contains('Add person').click()

    cy.url().should('include', '/practitioners/register')
    Page.verifyOnPage(RegisterPersonPage)
    cy.contains('h1', `Person's details`).should('be.visible')
  })

  it('should allow a practitioner to fill in and submit the person details form and take a photo', () => {
    cy.signIn({ failOnStatusCode: false })
    Page.verifyOnPage(IndexPage)
    cy.contains('Add person').click()

    const addPersonPage = Page.verifyOnPage(RegisterPersonPage)
    const firstName = 'Bilbo'
    const lastName = 'Baggins'

    addPersonPage.completeForm({
      firstName,
      lastName,
      day: '22',
      month: '9',
      year: '1920',
      crn: RegisterPersonPage.generateValidCrn(),
    })

    addPersonPage.continueButton().click()

    const takePhotoPage = Page.verifyOnPage(TakePhotoPage)
    cy.url().should('include', '/practitioners/register/photo')
    cy.contains('h1', `Take a photo of ${firstName} ${lastName}`).should('be.visible')
    takePhotoPage.videoElement().should('be.visible')
    takePhotoPage.takePhotoButton().should('be.visible')
    takePhotoPage.uploadInsteadLink().should('be.visible')
    takePhotoPage.takePhotoButton().click()
    cy.url().should('include', '/practitioners/register/photo/review')
    cy.contains('h1', 'Does this photo meet the rules?').should('be.visible')
  })
  it('should allow a user to upload a photo instead of using the camera', () => {
    cy.signIn({ failOnStatusCode: false })
    Page.verifyOnPage(IndexPage)
    cy.contains('Add person').click()

    const addPersonPage = Page.verifyOnPage(RegisterPersonPage)
    addPersonPage.completeForm({
      firstName: 'Samwise',
      lastName: 'Gamgee',
      day: '06',
      month: '04',
      year: '1980',
      crn: RegisterPersonPage.generateValidCrn(),
    })
    addPersonPage.continueButton().click()

    const takePhotoPage = Page.verifyOnPage(TakePhotoPage)
    takePhotoPage.uploadInsteadLink().click()

    const uploadPhotoPage = Page.verifyOnPage(UploadPhotoPage)
    cy.url().should('include', '/practitioners/register/photo/upload')
    uploadPhotoPage.uploadPhoto('person.jpg')
    uploadPhotoPage.uploadPhotoButton().click()

    cy.url().should('include', '/practitioners/register/photo/review')
    cy.contains('h1', 'Does this photo meet the rules?').should('be.visible')
  })
})
