import Page, { PageElement } from '../../../page'

export default class UpdateContactPreferencePage extends Page {
  constructor() {
    super('want us to send a link')
  }

  textMessageRadio = (): PageElement => cy.get('input[name="contactPreference"][value="TEXT"]')

  emailRadio = (): PageElement => cy.get('input[name="contactPreference"][value="EMAIL"]')

  continueButton = (): PageElement => cy.contains('button', 'Continue')

  selectEmail = (): void => {
    this.emailRadio().check()
  }

  selectText = (): void => {
    this.textMessageRadio().check()
  }
}
