import aggregateCheckinNotificationStatusSummary from './notificationStatusAggregation'
import Stats, { LabeledSiteCount } from '../data/models/stats'

const createMockStats = (inviteStatuses: LabeledSiteCount[]): Stats => ({
  inviteStatusPerSite: inviteStatuses,
  invitesPerSite: [],
  offendersPerSite: [],
  completedCheckinsPerSite: [],
  completedCheckinsPerNth: [],
  checkinAverages: [],
  checkinOutsideAccess: [],
  automatedIdCheckAccuracy: [],
  flaggedCheckinsPerSite: [],
  stoppedCheckinsPerSite: [],
  averageFlagsPerCheckinPerSite: [],
  callbackRequestPercentagePerSite: [],
  checkinFrequencyPerSite: [],
  averageReviewTimePerCheckinPerSite: [],
  averageReviewTimePerCheckinTotal: '',
  averageTimeToRegisterPerSite: [],
  averageTimeToRegisterTotal: '',
  averageCheckinCompletionTimePerSite: [],
  averageCheckinCompletionTimeTotal: '',
  averageTimeTakenToCompleteCheckinReviewPerSite: [],
  averageTimeTakenToCompleteCheckinReviewTotal: '',
})

describe('aggregateCheckinNotificationStatusSummary', () => {
  const mockRawData: LabeledSiteCount[] = [
    // Successfully delivered (delivered + sent)
    { location: 'Site A', label: 'delivered', count: 50 },
    { location: 'Site B', label: 'sent', count: 50 },
    // Failed to deliver and will not retry (permanent-failure)
    { location: 'Site A', label: 'permanent-failure', count: 10 },
    // Failed to deliver but could retry (temporary-failure)
    { location: 'Site C', label: 'temporary-failure', count: 5 },
    // Sending in progress (sending + pending + created)
    { location: 'Site B', label: 'sending', count: 20 },
    { location: 'Site C', label: 'pending', count: 10 },
    { location: 'Site A', label: 'created', count: 10 },
    // Unexpected/Other statuses
    { location: 'Site D', label: 'technical-failure', count: 4 },
    { location: 'Site D', label: 'unknown', count: 1 },
  ]
  // Grand Total: 50 + 50 + 10 + 5 + 20 + 10 + 10 + 4 + 1 = 160
  const mockStats = createMockStats(mockRawData)
  const result = aggregateCheckinNotificationStatusSummary(mockStats)

  it('should correctly calculate the grand total across all statuses and sites', () => {
    const totalCount = result.reduce((sum, item) => sum + item.count, 0)
    expect(totalCount).toBe(160)
  })

  it('should return the correct number of rows (required statuses + unexpected statuses)', () => {
    expect(result.length).toBe(6)
  })

  it('should list the four required status rows in the correct order', () => {
    expect(result[0].status).toBe('Successfully delivered')
    expect(result[1].status).toBe('Failed to deliver and will not retry')
    expect(result[2].status).toBe('Failed to deliver but could retry')
    expect(result[3].status).toBe('Sending in progress')
  })

  it('should correctly aggregate counts for each status category', () => {
    // Successfully delivered: 100
    expect(result[0].count).toBe(100)
    // Failed to deliver and will not retry: 10
    expect(result[1].count).toBe(10)
    // Failed to deliver but could retry: 5
    expect(result[2].count).toBe(5)
    // Sending in progress: 40
    expect(result[3].count).toBe(40)
  })

  it('should correctly calculate the percentage for required statuses (Total: 160)', () => {
    // Successfully delivered: 100 / 160 = 62.50
    expect(result[0].percentage).toBe(62.5)
    // Failed to deliver and will not retry: 10 / 160 = 6.25
    expect(result[1].percentage).toBe(6.25)
    // Failed to deliver but could retry: 5 / 160 = 3.13 (rounded up)
    expect(result[2].percentage).toBe(3.13)
    // Sending in progress: 40 / 160 = 25.00
    expect(result[3].percentage).toBe(25.0)
  })

  it('should handle an empty input array gracefully', () => {
    const emptyStats = createMockStats([])
    const emptyResult = aggregateCheckinNotificationStatusSummary(emptyStats)

    expect(emptyResult.length).toBe(4)
    expect(emptyResult.every(r => r.count === 0 && r.percentage === 0)).toBe(true)
  })
})
