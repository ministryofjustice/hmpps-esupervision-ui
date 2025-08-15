export default class OffenderCheckinLogs {
  hint: 'ALL' | 'SUBSET' | 'OMITTED'

  logs: {
    logEntryType: string
    comment: string
    practitioner: string
    offender: string
    createdAt: string
    checkin: string
  }[]
}
