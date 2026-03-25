export type HowEasy = 'veryEasy' | 'easy' | 'neitherEasyOrDifficult' | 'difficult' | 'veryDifficult' | 'notAnswered'

export type GettingSupport = 'yes' | 'no' | 'notAnswered'

export type Improvement =
  | 'findingOutAboutCheckIns'
  | 'beingSignedUpToCheckIns'
  | 'textOrEmailNotifications'
  | 'checkInQuestions'
  | 'takingAVideo'
  | 'gettingHelp'
  | 'whatHappenedAfterAskingForSupport'
  | 'whatHappenedAfterAskingForContact'
  | 'somethingElse'
  | 'nothingNeedsImproving'
  | 'notAnswered'

export interface V2Stats {
  signedUp: number
  activeUsers: number
  inactiveUsers: number
  completedCheckins: number
  notCompletedOnTime: number
  avgHoursToComplete: number
  avgCompletedCheckinsPerPerson: number
  pctActiveUsers: number
  pctInactiveUsers: number
  pctCompletedCheckins: number
  pctExpiredCheckins: number
  updatedAt: string
}

export interface V2FeedbackStats {
  feedbackTotal: number
  howEasyCounts: Partial<Record<HowEasy, number>>
  howEasyPct: Partial<Record<HowEasy, number>>
  gettingSupportCounts: Partial<Record<GettingSupport, number>>
  gettingSupportPct: Partial<Record<GettingSupport, number>>
  improvementsCounts: Partial<Record<Improvement, number>>
  improvementsPct: Partial<Record<Improvement, number>>
}

export interface ProviderInfo {
  providerCode: string
  providerDescription: string
  pctSignedUpOfTotal: number
}

export type V2StatsWithFeedback = V2Stats & V2FeedbackStats

export type V2ProviderStats = V2Stats & ProviderInfo

export interface V2StatsResponse {
  total: V2StatsWithFeedback
  providers: V2ProviderStats[]
}

type Month = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12'

type Year = `${number}${number}${number}${number}`

export type YearMonth = `${Year}-${Month}`
