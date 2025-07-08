import MentalHealth from './mentalHealth'
import SupportAspect from './supportAspect'
import CallbackRequested from './callbackRequested'

export default class SurveyResponse {
  mentalHealth: MentalHealth

  assistance: SupportAspect[]

  mentalHealthSupport: string

  alcoholSupport: string

  drugsSupport: string

  moneySupport: string

  housingSupport: string

  supportSystemSupport: string

  otherSupport: string

  callback: CallbackRequested

  callbackDetails: string
}
