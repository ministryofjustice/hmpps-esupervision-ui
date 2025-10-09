import Page, { PageElement } from '../../../page'

export default class UpdatePersonalDetailsPage extends Page {
  constructor() {
    super('Persons details')
  }

  firstNameField = (): PageElement => cy.get('#firstName')

  lastNameField = (): PageElement => cy.get('#lastName')

  dayField = (): PageElement => cy.get('[name="day"]')

  monthField = (): PageElement => cy.get('[name="month"]')

  yearField = (): PageElement => cy.get('[name="year"]')

  crnField = (): PageElement => cy.get('#crn')

  saveChangesButton = (): PageElement => cy.contains('button', 'Save changes')

  clearAndCompleteForm = (person: {
    firstName: string
    lastName: string
    day: string
    month: string
    year: string
    crn: string
  }): void => {
    this.firstNameField().clear().type(person.firstName)
    this.lastNameField().clear().type(person.lastName)
    this.dayField().clear().type(person.day)
    this.monthField().clear().type(person.month)
    this.yearField().clear().type(person.year)
    this.crnField().clear().type(person.crn)
  }
}
