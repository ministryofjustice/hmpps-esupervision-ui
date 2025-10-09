import Page, { PageElement } from '../../../page'

export default class TakePhotoPage extends Page {
  constructor() {
    super('Take a photo')
  }

  videoElement = (): PageElement => cy.get('#es-photo-capture__video')

  takePhotoButton = (): PageElement => cy.get('button#take-photo')

  uploadInsteadLink = (): PageElement => cy.contains('a', 'Upload photo instead')

  errorMessage = (): PageElement => cy.get('#es-photo-capture__error')
}
