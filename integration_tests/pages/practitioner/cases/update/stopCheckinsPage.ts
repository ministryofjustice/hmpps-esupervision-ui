import Page, { PageElement } from '../../../page'

export default class StopCheckInsPage extends Page {
  constructor() {
    super('Are you sure you want to stop check ins for')
  }

  yesRadio = (): PageElement => cy.get('input[name="stopCheckins"][value="YES"]')

  noRadio = (): PageElement => cy.get('input[name="stopCheckins"][value="NO"]')

  reasonTextarea = (): PageElement => cy.get('#stopCheckinDetails')

  continueButton = (): PageElement => cy.contains('button', 'Continue')

  selectYesAndProvideReason = (reason: string): void => {
    this.yesRadio().check()
    this.reasonTextarea().type(reason)
  }
}
