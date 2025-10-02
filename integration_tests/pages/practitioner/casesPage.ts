import Page, { PageElement } from '../page'

export default class CasesPage extends Page {
  constructor() {
    super('Cases')
  }

  checkInsTab = (): PageElement => cy.contains('a.govuk-service-navigation__link', 'Check ins')

  casesTab = (): PageElement => cy.contains('a.govuk-service-navigation__link', 'Cases')

  casesTable = (): PageElement => cy.get('table')
}
