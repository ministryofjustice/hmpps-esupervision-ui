import SubmissionPage, { PageElement } from './submissionPage'

export default class ConfirmationPage extends SubmissionPage {
  constructor() {
    super('Check in completed')
  }

  panelBody = (): PageElement => cy.get('.govuk-panel__body')
}
