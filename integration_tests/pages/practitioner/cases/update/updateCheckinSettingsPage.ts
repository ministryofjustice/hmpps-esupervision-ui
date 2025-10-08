import Page, { PageElement } from '../../../page'

export default class UpdateCheckInSettingsPage extends Page {
  constructor() {
    super('Change online check ins')
  }

  startDateField = (): PageElement => cy.get('#startDate')

  frequencyRadio = (value: 'WEEKLY' | 'TWO_WEEKS' | 'FOUR_WEEKS' | 'EIGHT_WEEKS'): PageElement =>
    cy.get(`input[name="frequency"][value="${value}"]`)

  saveChangesButton = (): PageElement => cy.contains('button', 'Save changes')

  selectFrequency = (value: 'WEEKLY' | 'TWO_WEEKS' | 'FOUR_WEEKS' | 'EIGHT_WEEKS'): void => {
    this.frequencyRadio(value).check()
  }

  enterStartDate = (date: string): void => {
    this.startDateField().type(date)
  }
}
