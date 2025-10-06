import Page, { PageElement } from '../../../page'

export default class UpdatePhotoPage extends Page {
  constructor() {
    super('Photo')
  }

  continueButton = (): PageElement => cy.contains('button', 'Continue')
}
