import Page, { PageElement } from '../../../page'

export default class UpdateMobilePage extends Page {
  constructor() {
    super('mobile number?')
  }

  mobileField = (): PageElement => cy.get('#mobile')

  saveChangesButton = (): PageElement => cy.contains('button', 'Save changes')

  enterMobile = (mobile: string): void => {
    this.mobileField().clear().type(mobile)
  }
}
