import Page, { PageElement } from '../page'

export default class RegisterPersonPage extends Page {
  constructor() {
    super("Person's details")
  }

  firstNameField = (): PageElement => cy.get('#firstName')

  lastNameField = (): PageElement => cy.get('#lastName')

  dayField = (): PageElement => cy.get('[name="day"]')

  monthField = (): PageElement => cy.get('[name="month"]')

  yearField = (): PageElement => cy.get('[name="year"]')

  crnField = (): PageElement => cy.get('#crn')

  continueButton = (): PageElement => cy.contains('button', 'Continue')

  completeForm = (person: {
    firstName: string
    lastName: string
    day: string
    month: string
    year: string
    crn: string
  }): void => {
    this.firstNameField().type(person.firstName)
    this.lastNameField().type(person.lastName)
    this.dayField().type(person.day)
    this.monthField().type(person.month)
    this.yearField().type(person.year)
    this.crnField().type(person.crn)
  }

  static generateValidCrn = (): string => {
    const capitalLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26))
    const numbers = Math.floor(100000 + Math.random() * 900000).toString()
    return `${capitalLetter}${numbers}`
  }
}
