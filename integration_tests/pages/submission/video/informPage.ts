import SubmissionPage, { PageElement } from '../submissionPage'

export default class VideoInformPage extends SubmissionPage {
  constructor() {
    super('Confirm your identity')
  }

  continueButton = (): PageElement => cy.contains('a.govuk-button', 'Continue')
}
