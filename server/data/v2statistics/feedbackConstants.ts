import { GettingSupport, HowEasy, Improvement } from '../models/v2stats'

export const HOW_EASY_OPTIONS: HowEasy[] = [
  'veryEasy',
  'easy',
  'neitherEasyOrDifficult',
  'difficult',
  'veryDifficult',
  'notAnswered',
]

export const GETTING_SUPPORT_OPTIONS: GettingSupport[] = ['yes', 'no', 'notAnswered']

export const IMPROVEMENT_OPTIONS: Improvement[] = [
  'findingOutAboutCheckIns',
  'beingSignedUpToCheckIns',
  'textOrEmailNotifications',
  'checkInQuestions',
  'takingAVideo',
  'gettingHelp',
  'whatHappenedAfterAskingForSupport',
  'whatHappenedAfterAskingForContact',
  'somethingElse',
  'nothingNeedsImproving',
  'notAnswered',
]
