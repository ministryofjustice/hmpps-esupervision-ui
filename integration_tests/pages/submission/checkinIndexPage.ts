import SubmissionPage, { PageElement } from './submissionPage'

export default class CheckinIndexPage extends SubmissionPage {
  constructor() {
    super('Check in with your probation officer')
  }

  startButton = (): PageElement => cy.contains('button', 'Start now')
}
