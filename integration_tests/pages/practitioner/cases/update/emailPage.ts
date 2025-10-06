import Page, { PageElement } from '../../../page'

export default class UpdateEmailPage extends Page {
  constructor() {
    super('email address?')
  }

  emailField = (): PageElement => cy.get('#email')

  continueButton = (): PageElement => cy.contains('button', 'Continue')

  enterEmail = (email: string): void => {
    this.emailField().clear().type(email)
  }
}
