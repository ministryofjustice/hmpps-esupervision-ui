import { PageElement } from '../page'
import SubmissionPage from './submissionPage'

export default class CallbackPage extends SubmissionPage {
  constructor() {
    super('Is there anything else you need to speak with your probation officer about?')
  }

  yesRadio = (): PageElement => cy.get('input[name="callback"][value="YES"]')

  noRadio = (): PageElement => cy.get('input[name="callback"][value="NO"]')

  detailsTextarea = (): PageElement => cy.get('#callbackDetails')

  continueButton = (): PageElement => cy.contains('button', 'Continue')

  selectYesAndProvideDetails = (details: string): void => {
    this.yesRadio().check()
    this.detailsTextarea().type(details)
  }

  selectNo = (): void => {
    this.noRadio().check()
  }
}
