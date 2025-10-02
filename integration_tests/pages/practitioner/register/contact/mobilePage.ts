import Page, { PageElement } from '../../../page'

export default class EnterMobilePage extends Page {
  constructor() {
    super('What is')
  }

  mobileField = (): PageElement => cy.get('#mobile')

  continueButton = (): PageElement => cy.contains('button', 'Continue')

  enterMobile = (mobile: string): void => {
    this.mobileField().type(mobile)
  }
}
