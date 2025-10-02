import Page, { PageElement } from '../../../page'

export default class EnterEmailPage extends Page {
  constructor() {
    super('What is')
  }

  emailField = (): PageElement => cy.get('#email')

  continueButton = (): PageElement => cy.contains('button', 'Continue')

  enterEmail = (email: string): void => {
    this.emailField().type(email)
  }
}
