import Page, { PageElement } from '../../page'

export default class CasesPage extends Page {
  constructor() {
    super('Cases')
  }

  checkInsTab = (): PageElement => cy.contains('a.govuk-service-navigation__link', 'Check ins')

  casesTab = (): PageElement => cy.contains('a.govuk-service-navigation__link', 'Cases')

  addPersonButton = (): PageElement => cy.contains('a.govuk-button', 'Add person')

  activeTab = (): PageElement => cy.contains('.moj-sub-navigation__link', 'Active')

  stoppedTab = (): PageElement => cy.contains('.moj-sub-navigation__link', 'Stopped')

  casesTable = (): PageElement => cy.get('.govuk-table')

  getCaseRow = (name: string): PageElement => this.casesTable().contains('tr', name)

  getManageLinkForRow = (row: PageElement): PageElement => row.find('a').contains(/Manage|View/)

  nextPageLink = (): PageElement => cy.get('.govuk-pagination__next')

  previousPageLink = (): PageElement => cy.get('.govuk-pagination__prev')
}
