import Page, { PageElement } from '../../page'

export default class DashboardPage extends Page {
  constructor() {
    super('Check ins')
  }

  addPersonButton = (): PageElement => cy.contains('a.govuk-button', 'Add person')

  checkInsTab = (): PageElement => cy.contains('a.govuk-service-navigation__link', 'Check ins')

  casesTab = (): PageElement => cy.contains('a.govuk-service-navigation__link', 'Cases')

  needsAttentionFilter = (): PageElement => cy.contains('.moj-sub-navigation__link', 'Needs attention')

  reviewedFilter = (): PageElement => cy.contains('.moj-sub-navigation__link', 'Reviewed')

  awaitingCheckInFilter = (): PageElement => cy.contains('.moj-sub-navigation__link', 'Awaiting check in')

  checkInsTable = (): PageElement => cy.get('table.govuk-table')

  getCheckInRow = (name: string): PageElement => this.checkInsTable().contains('tr', name)

  successBanner = (): PageElement => cy.get('.moj-alert--success')

  successBannerTitle = (): PageElement => this.successBanner().find('.moj-alert__title')

  successBannerMessage = (): PageElement => this.successBanner().find('.moj-alert__message')
}
