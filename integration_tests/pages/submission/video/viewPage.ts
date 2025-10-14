import SubmissionPage, { PageElement } from '../submissionPage'

export default class VideoViewPage extends SubmissionPage {
  constructor() {
    super('We cannot confirm this is you')
  }

  matchHeading = (): PageElement => cy.contains('h1', 'We have confirmed this is you')

  noMatchHeading = (): PageElement => cy.contains('h1', 'We cannot confirm this is you')

  continueButton = (): PageElement => cy.contains('a.govuk-button', 'Continue')

  recordAgainButton = (): PageElement => cy.contains('a.govuk-button', 'Record video again')

  submitAnywayButton = (): PageElement => cy.contains('a.govuk-button--secondary', 'Submit video anyway')
}
