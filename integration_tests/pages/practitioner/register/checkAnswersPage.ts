import Page, { PageElement } from '../../page'

export default class CheckYourAnswersPage extends Page {
  constructor() {
    super('Check your answers before adding the person')
  }

  confirmButton = (): PageElement => cy.get('#registerButton')

  verifySummaryValue = (keyText: string, expectedValue: string): void => {
    cy.contains('.govuk-summary-list__key', keyText)
      .siblings('.govuk-summary-list__value')
      .should('contain.text', expectedValue)
  }
}
