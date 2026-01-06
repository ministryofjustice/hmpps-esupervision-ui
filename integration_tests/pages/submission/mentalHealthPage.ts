import SubmissionPage, { PageElement } from './submissionPage'

export default class MentalHealthPage extends SubmissionPage {
  constructor() {
    super('How have you been feeling since we last spoke?')
  }

  veryWellRadio = (): PageElement => cy.get('input[name="mentalHealth"][value="VERY_WELL"]')

  wellRadio = (): PageElement => cy.get('input[name="mentalHealth"][value="WELL"]')

  okRadio = (): PageElement => cy.get('input[name="mentalHealth"][value="OK"]')

  notGreatRadio = (): PageElement => cy.get('input[name="mentalHealth"][value="NOT_GREAT"]')

  strugglingRadio = (): PageElement => cy.get('input[name="mentalHealth"][value="STRUGGLING"]')

  continueButton = (): PageElement => cy.contains('button', 'Continue')
}
