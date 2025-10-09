import Page, { PageElement } from '../../../page'

export default class ReviewPhotoPage extends Page {
  constructor() {
    super('Does this photo meet the rules?')
  }

  continueButton = (): PageElement => cy.contains('a.govuk-button', 'Yes, continue')

  uploadAnotherButton = (): PageElement => cy.contains('a.govuk-button--secondary', 'No, upload another photo')

  takeAnotherButton = (): PageElement => cy.contains('a.govuk-button--secondary', 'No, take another photo')

  uploadedImage = (): PageElement => cy.get('.es-uploaded-image')
}
