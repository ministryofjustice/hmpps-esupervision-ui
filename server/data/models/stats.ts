export type SiteCount = {
  location: string
  count: number
}

export type SiteCountOnNthDay = {
  location: string
  count: number
  day: number
}

export default class Stats {
  checkinsPerSite: SiteCount[]

  completedCheckinsPerSite: SiteCount[]

  completedCheckinsPerNth: SiteCountOnNthDay[]

  offendersPerSite: SiteCount[]
}
