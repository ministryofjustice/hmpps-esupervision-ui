import SubmissionPage, { PageElement } from './submissionPage'

export default class CheckYourAnswersPage extends SubmissionPage {
  constructor() {
    super('Check your answers before you complete your check in')
  }

  confirmCheckbox = (): PageElement => cy.get('input[name="checkAnswers"][value="CONFIRM"]')

  completeCheckinButton = (): PageElement => cy.contains('button', 'Complete check in')

  verifySummaryValue = (key: string, value: string): void => {
    cy.get('.govuk-summary-list__key')
      .contains(key)
      .siblings('.govuk-summary-list__value')
      .should('contain.text', value)
  }

  clickChangeLink = (key: string): void => {
    cy.get('.govuk-summary-list__key')
      .contains(key)
      .siblings('.govuk-summary-list__actions')
      .find('a')
      .contains('Change')
      .click()
  }
}
