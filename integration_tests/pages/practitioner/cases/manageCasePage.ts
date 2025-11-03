import Page, { PageElement } from '../../page'

interface Offender {
  firstName: string
  lastName: string
}

export default class ManageCasePage extends Page {
  constructor() {
    super('Manage check ins')
  }

  pageHeading = (): PageElement => cy.get('.govuk-heading-l')

  stopCheckInsButton = (): PageElement => cy.contains('a.govuk-button--warning', 'Stop check ins')

  resendCheckinLink = (): Cypress.Chainable => cy.get('a[href*="/resend"]')

  successMessageBody = (): Cypress.Chainable => cy.get('.moj-alert--success .moj-alert__content')

  stoppedCheckInsAlert = (): PageElement => cy.get('.moj-alert--info')

  changePersonalDetailsLink = (): PageElement =>
    cy.get('.govuk-summary-card').contains('h2', 'Personal details').siblings('ul').find('a').contains('Change')

  changeContactDetailsLink = (): PageElement =>
    cy.get('.govuk-summary-card').contains('h2', 'Contact details').siblings('ul').find('a').contains('Change')

  changeCheckInSettingsLink = (): PageElement =>
    cy.get('.govuk-summary-card').contains('h2', 'Check in settings').siblings('ul').find('a').contains('Change')

  verifyHeaderContains = (offender: Offender, formattedDob: string): void => {
    this.pageHeading().should('contain.text', `${offender.firstName} ${offender.lastName} (${formattedDob})`)
  }

  verifySummaryValue = (key: string, value: string): void => {
    cy.get('.govuk-summary-list__key')
      .contains(key)
      .siblings('.govuk-summary-list__value')
      .should('contain.text', value)
  }
}
