import SubmissionPage, { PageElement } from './submissionPage'

export default class PersonalDetailsPage extends SubmissionPage {
  constructor() {
    super('Personal details')
  }

  startButton = (): PageElement => cy.contains('button', 'Start now')

  firstNameField = (): PageElement => cy.get('#firstName')

  lastNameField = (): PageElement => cy.get('#lastName')

  dayField = (): PageElement => cy.get('[name="day"]')

  monthField = (): PageElement => cy.get('[name="month"]')

  yearField = (): PageElement => cy.get('[name="year"]')

  continueButton = (): PageElement => cy.contains('button', 'Continue')

  completeForm = (details: { firstName: string; lastName: string; day: string; month: string; year: string }): void => {
    this.firstNameField().type(details.firstName)
    this.lastNameField().type(details.lastName)
    this.dayField().type(details.day)
    this.monthField().type(details.month)
    this.yearField().type(details.year)
  }
}
