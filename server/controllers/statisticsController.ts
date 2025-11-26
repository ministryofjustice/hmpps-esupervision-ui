import { RequestHandler } from 'express'
import { services } from '../services'

import { indexByLocation } from '../utils/indexByLocation'
import aggregateCheckinNotificationStatusSummary from '../utils/notificationStatusAggregation'
import { LabeledSiteCount } from '../data/models/stats'
import formatAverageTimeStats from '../utils/stats'

const { esupervisionService } = services()

// Data
const renderDataDashboard: RequestHandler = async (req, res, next) => {
  try {
    const stats = await esupervisionService.getCheckinStats()
    // Get a list of all sites from the offendersPerSite statistics and sort alphabetically
    const sites = stats.offendersPerSite
      .map(site => site.location)
      .filter(location => location.toLowerCase() !== 'unknown')
      .sort()

    const checkinNotificationStatusSummary = aggregateCheckinNotificationStatusSummary(stats)
    const offendersByLocation = indexByLocation(stats.offendersPerSite, r => r.count)
    const invitesByLocation = indexByLocation(stats.invitesPerSite, r => r.count)
    const completedByLocation = indexByLocation(stats.completedCheckinsPerSite, r => r.count)
    const completedByLocationOnDay1 = indexByLocation(
      stats.completedCheckinsPerNth.filter(r => r.day === 1),
      r => r.count,
    )
    const completedByLocationOnDay2 = indexByLocation(
      stats.completedCheckinsPerNth.filter(r => r.day === 2),
      r => r.count,
    )
    const completedByLocationOnDay3 = indexByLocation(
      stats.completedCheckinsPerNth.filter(r => r.day === 3),
      r => r.count,
    )
    const mismatchByLocation = indexByLocation(stats.automatedIdCheckAccuracy, r => r.mismatchCount)
    const completedAvgByLocation = indexByLocation(stats.checkinAverages, r => r.completedAvg)
    const expiredAvgByLocation = indexByLocation(stats.checkinAverages, r => r.expiredAvg)
    const expiredTotalByLocation = indexByLocation(stats.checkinAverages, r => r.expiredTotal)
    const ontimePercentageByLocation = indexByLocation(stats.checkinAverages, r => {
      const total = r.completedTotal + r.expiredTotal
      const percentage = total > 0 ? (r.completedTotal / total) * 100 : 0
      return Number(percentage.toFixed(2))
    })
    const missedPercentageByLocation = indexByLocation(stats.checkinAverages, r => r.missedPercentage)
    const flaggedCheckinsByLocation = indexByLocation(stats.flaggedCheckinsPerSite, r => r.count)
    const stoppedCheckinsByLocation = indexByLocation(stats.stoppedCheckinsPerSite, r => r.count)
    const averageFlagsPerCheckinPerSite = indexByLocation(stats.averageFlagsPerCheckinPerSite, r => r.average)
    const callbackRequestPercentagePerSite = indexByLocation(stats.callbackRequestPercentagePerSite, r => r.average)
    const checkin7daysFrequencyPerSite = indexByLocation(
      stats.checkinFrequencyPerSite.filter(r => r.intervalDays === 7),
      r => r.count,
    )

    const checkin14daysFrequencyPerSite = indexByLocation(
      stats.checkinFrequencyPerSite.filter(r => r.intervalDays === 14),
      r => r.count,
    )

    const checkin28daysFrequencyPerSite = indexByLocation(
      stats.checkinFrequencyPerSite.filter(r => r.intervalDays === 28),
      r => r.count,
    )

    const checkin56daysFrequencyPerSite = indexByLocation(
      stats.checkinFrequencyPerSite.filter(r => r.intervalDays === 56),
      r => r.count,
    )

    const averageReviewResponseTime = indexByLocation(stats.averageReviewTimePerCheckinPerSite, r =>
      formatAverageTimeStats(r.averageTimeText),
    )
    const averageReviewResponseTimeTotal = formatAverageTimeStats(stats.averageReviewTimePerCheckinTotal)

    const checkinOutsideAccess = indexByLocation(stats.checkinOutsideAccess, r => r.count)

    const deviceTypes: Map<string, { locations: Map<string, LabeledSiteCount>; percentage: number; total: number }> =
      new Map()
    stats.deviceType.forEach(item => {
      const found = deviceTypes.get(item.label)
      if (found) {
        found.locations.set(item.location, item)
      } else {
        deviceTypes.set(item.label, {
          locations: new Map([[item.location, item]]),
          percentage: item.percentage,
          total: item.total,
        })
      }
    })
    const averageTimeToRegister = indexByLocation(stats.averageTimeToRegisterPerSite, r =>
      formatAverageTimeStats(r.averageTimeText),
    )
    const averageTimeToRegisterTotal = formatAverageTimeStats(stats.averageTimeToRegisterTotal)

    const averageCheckinCompletionTime = indexByLocation(stats.averageCheckinCompletionTimePerSite, r =>
      formatAverageTimeStats(r.averageTimeText),
    )
    const averageCheckinCompletionTimeTotal = formatAverageTimeStats(stats.averageCheckinCompletionTimeTotal)

    const averageTimeTakenToCompleteCheckinReviewPerSite = indexByLocation(
      stats.averageTimeTakenToCompleteCheckinReviewPerSite,
      r => formatAverageTimeStats(r.averageTimeText),
    )
    const averageTimeTakenToCompleteCheckinReviewTotal = formatAverageTimeStats(
      stats.averageTimeTakenToCompleteCheckinReviewTotal,
    )

    res.render('pages/statistics/dashboard', {
      sites,
      offendersByLocation,
      invitesByLocation,
      checkinNotificationStatusSummary,
      completedByLocation,
      completedByLocationOnDay1,
      completedByLocationOnDay2,
      completedByLocationOnDay3,
      expiredTotalByLocation,
      ontimePercentageByLocation,
      mismatchByLocation,
      completedAvgByLocation,
      expiredAvgByLocation,
      missedPercentageByLocation,
      flaggedCheckinsByLocation,
      stoppedCheckinsByLocation,
      averageFlagsPerCheckinPerSite,
      callbackRequestPercentagePerSite,
      checkin7daysFrequencyPerSite,
      checkin14daysFrequencyPerSite,
      checkin28daysFrequencyPerSite,
      checkin56daysFrequencyPerSite,
      averageReviewResponseTime,
      averageReviewResponseTimeTotal,
      checkinOutsideAccess,
      deviceTypes,
      averageTimeToRegister,
      averageTimeToRegisterTotal,
      averageCheckinCompletionTime,
      averageCheckinCompletionTimeTotal,
      averageTimeTakenToCompleteCheckinReviewPerSite,
      averageTimeTakenToCompleteCheckinReviewTotal,
    })
  } catch (error) {
    next(error)
  }
}

export default renderDataDashboard
