import Stats, { CheckinNotificationStatusSummary, LabeledSiteCount } from '../data/models/stats'

/**
 *
 * maps Gov Notify statuses to readable labels
 *
 */
const mapStatusLabel = (status: string): string => {
  const lookup: Record<string, string> = {
    delivered: 'Successfully delivered',
    sent: 'Successfully delivered',
    'permanent-failure': 'Failed to deliver and will not retry',
    'temporary-failure': 'Failed to deliver but could retry',
    sending: 'Sending in progress',
    pending: 'Sending in progress',
    created: 'Sending in progress',
  }
  return lookup[status] || status
}

/**
 * Aggregates site-specific check in invite status data into a summary list with percentages.
 * Ensures all status counts are accounted for in the grand total.
 */
const aggregateCheckinNotificationStatusSummary = (stats: Stats): CheckinNotificationStatusSummary[] => {
  const statusCounts = new Map<string, number>()
  let grandTotal = 0

  stats.inviteStatusPerSite.forEach((item: LabeledSiteCount) => {
    const displayLabel = mapStatusLabel(item.label)
    const current = statusCounts.get(displayLabel) || 0
    statusCounts.set(displayLabel, current + item.count)
    grandTotal += item.count
  })

  const summary: CheckinNotificationStatusSummary[] = []

  const requiredStatuses = [
    'Successfully delivered',
    'Failed to deliver and will not retry',
    'Failed to deliver but could retry',
    'Sending in progress',
  ]

  for (const status of requiredStatuses) {
    const count = statusCounts.get(status) || 0
    const percentage = grandTotal > 0 ? Number(((count / grandTotal) * 100).toFixed(2)) : 0

    summary.push({
      status,
      count,
      percentage,
    })
    statusCounts.delete(status)
  }

  for (const [status, count] of statusCounts.entries()) {
    const percentage = grandTotal > 0 ? Number(((count / grandTotal) * 100).toFixed(2)) : 0
    summary.push({
      status,
      count,
      percentage,
    })
  }

  return summary
}

export default aggregateCheckinNotificationStatusSummary
