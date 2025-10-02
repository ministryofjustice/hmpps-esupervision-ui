import Page, { PageElement } from '../page'

export default class DashboardPage extends Page {
  constructor() {
    super('Check ins')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  headerPhaseBanner = (): PageElement => cy.get('[data-qa=header-phase-banner]')

  checkInsTab = (): PageElement => cy.contains('a.govuk-service-navigation__link', 'Check ins')

  casesTab = (): PageElement => cy.contains('a.govuk-service-navigation__link', 'Cases')

  checkInsTable = (): PageElement => cy.get('table')

  successBanner = (): PageElement => cy.get('.govuk-notification-banner--success')

  successBannerTitle = (): PageElement => this.successBanner().find('.govuk-notification-banner__title')

  successBannerMessage = (): PageElement => this.successBanner().find('.govuk-notification-banner__content p')
}
