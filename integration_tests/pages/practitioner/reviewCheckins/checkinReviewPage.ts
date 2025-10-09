import Page, { PageElement } from '../../page'

export default class CheckinReviewPage extends Page {
  constructor() {
    super('Check-in')
  }

  checkOnPage(): void {
    cy.get('.govuk-caption-l').contains('Check-in')
    cy.get('h1.govuk-heading-l').should('exist')
  }

  heading = (): PageElement => cy.get('h1.govuk-heading-l')

  identityConfirmedTag = (): PageElement => cy.get('.govuk-tag--green').contains('Identity confirmed')

  identityNotConfirmedTag = (): PageElement => cy.get('.govuk-tag--red').contains('Identity not confirmed')

  manageCheckinsLink = (): PageElement => cy.get('.es-page-actions__actions a')

  summaryList = (): PageElement => cy.get('dl.govuk-summary-list')

  viewVideoButton = (): PageElement => this.summaryList().find('a').contains('View video')

  idVerificationYesRadio = (): PageElement => cy.get('[name=idVerification][value=YES]')

  idVerificationNoRadio = (): PageElement => cy.get('[name=idVerification][value=NO]')

  missedCheckinCommentTextArea = (): PageElement => cy.get('#missedCheckinComment')

  markAsReviewedButton = (): PageElement => cy.get('button.govuk-button').contains('Mark as reviewed')

  verifySummaryValue = (key: string, value: string): void => {
    this.summaryList()
      .find('.govuk-summary-list__key')
      .contains(key)
      .parent()
      .find('.govuk-summary-list__value')
      .should('contain.text', value)
  }

  reviewAsIdentityMatch = (): void => {
    this.idVerificationYesRadio().click()
    this.markAsReviewedButton().click()
  }

  reviewAsIdentityMismatch = (): void => {
    this.idVerificationNoRadio().click()
    this.markAsReviewedButton().click()
  }

  reviewMissedCheckin = (comment: string): void => {
    this.missedCheckinCommentTextArea().type(comment)
    this.markAsReviewedButton().click()
  }
}
