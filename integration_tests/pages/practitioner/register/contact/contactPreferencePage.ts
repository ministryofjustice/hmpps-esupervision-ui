import Page, { PageElement } from '../../../page'

export default class ContactPreferencePage extends Page {
  constructor() {
    super('want us to send a link')
  }

  emailRadioButton = (): PageElement => cy.get('input[name="contactPreference"][value="EMAIL"]')

  textRadioButton = (): PageElement => cy.get('input[name="contactPreference"][value="TEXT"]')

  continueButton = (): PageElement => cy.contains('button', 'Continue')

  selectEmail = (): void => {
    this.emailRadioButton().click()
  }

  selectText = (): void => {
    this.textRadioButton().click()
  }
}
