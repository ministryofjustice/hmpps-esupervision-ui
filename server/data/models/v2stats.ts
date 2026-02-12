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
  totalSignedUp: number
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

export type V2StatsWithFeedback = V2Stats & V2FeedbackStats

export interface V2FeedbackStatsFormatted {
  feedbackTotal: number

  howEasyCounts: Record<HowEasy, number>
  howEasyPct: Record<HowEasy, string>

  gettingSupportCounts: Record<GettingSupport, number>
  gettingSupportPct: Record<GettingSupport, string>

  improvementsCounts: Record<Improvement, number>
  improvementsPct: Record<Improvement, string>
}
