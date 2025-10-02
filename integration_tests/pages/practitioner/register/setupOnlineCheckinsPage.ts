import Page, { PageElement } from '../../page'

export default class SetUpCheckInPage extends Page {
  constructor() {
    super('Set up online check ins')
  }

  startDateInput = (): PageElement => cy.get('#startDate')

  frequencyRadio = (value: 'WEEKLY' | 'TWO_WEEKS' | 'FOUR_WEEKS' | 'EIGHT_WEEKS'): PageElement =>
    cy.get(`input[name="frequency"][value="${value}"]`)

  continueButton = (): PageElement => cy.contains('button', 'Continue')

  enterStartDate = (dateString: string): void => {
    this.startDateInput().type(dateString)
  }

  selectFrequency = (value: 'WEEKLY' | 'TWO_WEEKS' | 'FOUR_WEEKS' | 'EIGHT_WEEKS'): void => {
    this.frequencyRadio(value).click()
  }
}
