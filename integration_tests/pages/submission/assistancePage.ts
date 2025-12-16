import { PageElement } from '../page'
import SubmissionPage from './submissionPage'

export type AssistanceOption =
  | 'MENTAL_HEALTH'
  | 'ALCOHOL'
  | 'DRUGS'
  | 'MONEY'
  | 'HOUSING'
  | 'SUPPORT_SYSTEM'
  | 'OTHER'
  | 'NO_HELP'

export default class AssistancePage extends SubmissionPage {
  constructor() {
    super('Is there anything you need support with or want to let us know about?')
  }

  continueButton = (): PageElement => cy.contains('button', 'Continue')

  selectMentalHealth = (): PageElement => this.getCheckbox('MENTAL_HEALTH').check()

  selectAlcohol = (): PageElement => this.getCheckbox('ALCOHOL').check()

  selectDrugs = (): PageElement => this.getCheckbox('DRUGS').check()

  selectMoney = (): PageElement => this.getCheckbox('MONEY').check()

  selectHousing = (): PageElement => this.getCheckbox('HOUSING').check()

  selectSupportSystem = (): PageElement => this.getCheckbox('SUPPORT_SYSTEM').check()

  selectOther = (): PageElement => this.getCheckbox('OTHER').check()

  selectNoHelp = (): PageElement => this.getCheckbox('NO_HELP').check()

  enterMentalHealthReason = (reason: string): PageElement => this.getConditionalTextarea('MENTAL_HEALTH').type(reason)

  enterAlcoholReason = (reason: string): PageElement => this.getConditionalTextarea('ALCOHOL').type(reason)

  enterDrugsReason = (reason: string): PageElement => this.getConditionalTextarea('DRUGS').type(reason)

  enterMoneyReason = (reason: string): PageElement => this.getConditionalTextarea('MONEY').type(reason)

  enterHousingReason = (reason: string): PageElement => this.getConditionalTextarea('HOUSING').type(reason)

  enterSupportSystemReason = (reason: string): PageElement => this.getConditionalTextarea('SUPPORT_SYSTEM').type(reason)

  enterOtherReason = (reason: string): PageElement => this.getConditionalTextarea('OTHER').type(reason)

  private getCheckbox = (option: AssistanceOption): PageElement => cy.get(`input[name="assistance"][value="${option}"]`)

  private getConditionalTextarea = (option: AssistanceOption): PageElement => {
    const id = `${option.toLowerCase().replace(/_(\w)/g, (match, p1) => p1.toUpperCase())}Support`
    return cy.get(`#${id}`)
  }
}
