import MentalHealth from './mentalHealth'
import SupportAspect from './supportAspect'
import CallbackRequested from './callbackRequested'

export type SurveyVersion = string

export interface Versioned {
  version: SurveyVersion
}

export interface DeviceInfo {
  userAgent: string
  platform: string
  screenResolution: string
  pixelRatio: number
  touchSupport: boolean
  os: string
  osVersion: string
  deviceType: string
  manufacturer: string
  model: string
  browser: string
  browserVersion: string
}

export default class SurveyResponse implements Versioned {
  version: SurveyVersion

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

  device?: DeviceInfo
}
