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
  ontimePercentage: number
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

export type SiteFormattedTimeAverage = {
  location: string
  averageTimeText: string
}

export type LabeledSiteCount = {
  location: string
  label: string
  count: number
  // total for given label
  total?: number
  percentage?: number
}

export type CheckinNotificationStatusSummary = {
  status: string
  count: number
  percentage: number
}

export default class Stats {
  invitesPerSite: SiteCount[]

  invitesTotal: number

  inviteStatusPerSite: LabeledSiteCount[]

  completedCheckinsPerSite: SiteCount[]

  completedCheckinsTotal: number

  completedCheckinsPerNth: SiteCountOnNthDay[]

  completedDay1Total: number

  completedDay1Percentage: number

  completedDay2Total: number

  completedDay2Percentage: number

  completedDay3Total: number

  completedDay3Percentage: number

  offendersPerSite: SiteCount[]

  offendersTotal: number

  checkinAverages: SiteCheckinAverage[]

  ontimeCheckinPercentageTotal: number

  checkinCompletedAverageTotal: number

  expiredCheckinsTotal: number

  expiredCheckinsPercentageTotal: number

  checkinOutsideAccess: SiteCount[]

  checkinOutsideAccessTotal: number

  automatedIdCheckAccuracy: IdCheckAccuracy[]

  automatedIdCheckAccuracyTotal: number

  automatedIdCheckAccuracyPercentageTotal: number

  flaggedCheckinsPerSite: SiteCount[]

  flaggedCheckinsTotal: number

  flaggedCheckinsPercentageTotal: number

  stoppedCheckinsPerSite: SiteCount[]

  stoppedCheckinsTotal: number

  averageFlagsPerCheckinPerSite: SiteAverage[]

  averageFlagsPerCheckinTotal: number

  callbackRequestPercentagePerSite: SiteAverage[]

  callbackRequestPercentageTotal: number

  checkinFrequencyPerSite: FrequencyCount[]

  frequencyWeeklyTotal: number

  frequencyFortnightlyTotal: number

  frequency4WeeksTotal: number

  frequency8WeeksTotal: number

  averageReviewTimePerCheckinPerSite: SiteFormattedTimeAverage[]

  averageReviewTimePerCheckinTotal: string

  averageTimeToRegisterPerSite: SiteFormattedTimeAverage[]

  averageTimeToRegisterTotal: string

  averageCheckinCompletionTimePerSite: SiteFormattedTimeAverage[]

  averageCheckinCompletionTimeTotal: string

  averageTimeTakenToCompleteCheckinReviewPerSite: SiteFormattedTimeAverage[]

  averageTimeTakenToCompleteCheckinReviewTotal: string

  deviceType: LabeledSiteCount[]
}
