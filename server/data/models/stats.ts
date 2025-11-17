export type SiteCount = {
  location: string
  count: number
}

export type SiteCountOnNthDay = {
  location: string
  count: number
  day: number
}

export type SiteCheckinAverage = {
  location: string
  completedAvg: number
  completedStdDev: number
  expiredAvg: number
  expiredStdDev: number
  completedTotal: number
  expiredTotal: number
  missedPercentage: number
}

export type IdCheckAccuracy = {
  location: string
  mismatchCount: number
  falsePositivesAvg: number
  falsePositiveStdDev: number
  falseNegativesAvg: number
  falseNegativesStdDev: number
}

export type SiteAverage = {
  location: string
  average: number
}

export type FrequencyCount = {
  location: string
  intervalDays: number
  count: number
}

export type TimeAverage = {
  location: string
  averageTimeText: string
}

export type LabeledSiteCount = {
  location: string
  label: string
  count: number
}

export default class Stats {
  invitesPerSite: SiteCount[]

  inviteStatusPerSite: LabeledSiteCount[]

  completedCheckinsPerSite: SiteCount[]

  completedCheckinsPerNth: SiteCountOnNthDay[]

  offendersPerSite: SiteCount[]

  checkinAverages: SiteCheckinAverage[]

  automatedIdCheckAccuracy: IdCheckAccuracy[]

  flaggedCheckinsPerSite: SiteCount[]

  stoppedCheckinsPerSite: SiteCount[]

  averageFlagsPerCheckinPerSite: SiteAverage[]

  callbackRequestPercentagePerSite: SiteAverage[]

  checkinFrequencyPerSite: FrequencyCount[]

  averageReviewTimePerCheckinPerSite: TimeAverage[]

  averageReviewTimePerCheckinTotal: string

  averageSecondsToRegister: SiteAverage[]

  averageCheckinCompletionTimePerSite: TimeAverage[]

  averageCheckinCompletionTimeTotal: string
}
