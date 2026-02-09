import { RequestHandler } from 'express'
import { services } from '../services'
import { indexByLocation } from '../utils/indexByLocation'
import aggregateCheckinNotificationStatusSummary from '../utils/notificationStatusAggregation'
import formatDeviceTypeStats from '../utils/statistics'
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
    const { offendersTotal } = stats

    const invitesByLocation = indexByLocation(stats.invitesPerSite, r => r.count)
    const { invitesTotal } = stats

    const completedCheckinsByLocation = indexByLocation(stats.completedCheckinsPerSite, r => r.count)
    const { completedCheckinsTotal } = stats

    const completedCheckinsPerSiteOnDay1ByLocation = indexByLocation(
      stats.completedCheckinsPerNth.filter(r => r.day === 1),
      r => r.count,
    )
    const { completedDay1Total, completedDay1Percentage } = stats

    const completedCheckinsPerSiteOnDay2ByLocation = indexByLocation(
      stats.completedCheckinsPerNth.filter(r => r.day === 2),
      r => r.count,
    )
    const { completedDay2Total, completedDay2Percentage } = stats

    const completedCheckinsPerSiteOnDay3ByLocation = indexByLocation(
      stats.completedCheckinsPerNth.filter(r => r.day === 3),
      r => r.count,
    )
    const { completedDay3Total, completedDay3Percentage } = stats

    const mismatchByLocation = indexByLocation(stats.automatedIdCheckAccuracy, r => r.mismatchCount)
    const { automatedIdCheckAccuracyTotal, automatedIdCheckAccuracyPercentageTotal } = stats

    const completedAvgByLocation = indexByLocation(stats.checkinAverages, r => r.completedAvg)
    const expiredAvgByLocation = indexByLocation(stats.checkinAverages, r => r.expiredAvg)

    const expiredTotalByLocation = indexByLocation(stats.checkinAverages, r => r.expiredTotal)
    const { expiredCheckinsTotal, expiredCheckinsPercentageTotal } = stats

    const ontimePercentageByLocation = indexByLocation(stats.checkinAverages, r => r.ontimePercentage)
    const { ontimeCheckinPercentageTotal } = stats
    const { checkinCompletedAverageTotal } = stats

    const missedPercentageByLocation = indexByLocation(stats.checkinAverages, r => r.missedPercentage)

    const flaggedCheckinsByLocation = indexByLocation(stats.flaggedCheckinsPerSite, r => r.count)
    const { flaggedCheckinsTotal, flaggedCheckinsPercentageTotal } = stats

    const stoppedCheckinsByLocation = indexByLocation(stats.stoppedCheckinsPerSite, r => r.count)
    const { stoppedCheckinsTotal } = stats

    const averageFlagsPerCheckinByLocation = indexByLocation(stats.averageFlagsPerCheckinPerSite, r => r.average)
    const { averageFlagsPerCheckinTotal } = stats

    const callbackRequestPercentageByLocation = indexByLocation(stats.callbackRequestPercentagePerSite, r => r.average)
    const { callbackRequestPercentageTotal } = stats

    const checkin7daysFrequencyByLocation = indexByLocation(
      stats.checkinFrequencyPerSite.filter(r => r.intervalDays === 7),
      r => r.count,
    )
    const { frequencyWeeklyTotal } = stats

    const checkin14daysFrequencyByLocation = indexByLocation(
      stats.checkinFrequencyPerSite.filter(r => r.intervalDays === 14),
      r => r.count,
    )
    const { frequencyFortnightlyTotal } = stats

    const checkin28daysFrequencyByLocation = indexByLocation(
      stats.checkinFrequencyPerSite.filter(r => r.intervalDays === 28),
      r => r.count,
    )
    const { frequency4WeeksTotal } = stats

    const checkin56daysFrequencyByLocation = indexByLocation(
      stats.checkinFrequencyPerSite.filter(r => r.intervalDays === 56),
      r => r.count,
    )
    const { frequency8WeeksTotal } = stats

    const checkinOutsideAccessByLocation = indexByLocation(stats.checkinOutsideAccess, r => r.count)
    const { checkinOutsideAccessTotal } = stats

    const deviceTypes = formatDeviceTypeStats(stats.deviceType)

    const averageReviewResponseTimeByLocation = indexByLocation(stats.averageReviewTimePerCheckinPerSite, r =>
      formatAverageTimeStats(r.averageTimeText),
    )
    const averageReviewResponseTimeTotal = formatAverageTimeStats(stats.averageReviewTimePerCheckinTotal)

    const averageTimeToRegisterByLocation = indexByLocation(stats.averageTimeToRegisterPerSite, r =>
      formatAverageTimeStats(r.averageTimeText),
    )
    const averageTimeToRegisterTotal = formatAverageTimeStats(stats.averageTimeToRegisterTotal)

    const averageCheckinCompletionTimeByLocation = indexByLocation(stats.averageCheckinCompletionTimePerSite, r =>
      formatAverageTimeStats(r.averageTimeText),
    )
    const averageCheckinCompletionTimeTotal = formatAverageTimeStats(stats.averageCheckinCompletionTimeTotal)

    const averageTimeTakenToCompleteCheckinReviewByLocation = indexByLocation(
      stats.averageTimeTakenToCompleteCheckinReviewPerSite,
      r => formatAverageTimeStats(r.averageTimeText),
    )
    const averageTimeTakenToCompleteCheckinReviewTotal = formatAverageTimeStats(
      stats.averageTimeTakenToCompleteCheckinReviewTotal,
    )

    res.render('pages/statistics/dashboard', {
      sites,
      offendersByLocation,
      offendersTotal,
      invitesByLocation,
      invitesTotal,
      checkinNotificationStatusSummary,
      completedCheckinsByLocation,
      completedCheckinsTotal,
      completedCheckinsPerSiteOnDay1ByLocation,
      completedDay1Total,
      completedDay1Percentage,
      completedCheckinsPerSiteOnDay2ByLocation,
      completedDay2Total,
      completedDay2Percentage,
      completedCheckinsPerSiteOnDay3ByLocation,
      completedDay3Total,
      completedDay3Percentage,

      missedPercentageByLocation,
      expiredCheckinsTotal,
      expiredCheckinsPercentageTotal,
      ontimePercentageByLocation,
      ontimeCheckinPercentageTotal,
      checkinCompletedAverageTotal,
      mismatchByLocation,
      completedAvgByLocation,
      expiredAvgByLocation,
      expiredTotalByLocation,
      automatedIdCheckAccuracyTotal,
      automatedIdCheckAccuracyPercentageTotal,
      flaggedCheckinsByLocation,
      flaggedCheckinsTotal,
      flaggedCheckinsPercentageTotal,
      stoppedCheckinsByLocation,
      stoppedCheckinsTotal,
      averageFlagsPerCheckinByLocation,
      averageFlagsPerCheckinTotal,
      callbackRequestPercentageByLocation,
      callbackRequestPercentageTotal,
      checkin7daysFrequencyByLocation,
      frequencyWeeklyTotal,
      checkin14daysFrequencyByLocation,
      frequencyFortnightlyTotal,
      checkin28daysFrequencyByLocation,
      frequency4WeeksTotal,
      checkin56daysFrequencyByLocation,
      frequency8WeeksTotal,
      checkinOutsideAccessByLocation,
      checkinOutsideAccessTotal,
      deviceTypes,
      averageReviewResponseTimeByLocation,
      averageReviewResponseTimeTotal,
      averageTimeToRegisterByLocation,
      averageTimeToRegisterTotal,
      averageCheckinCompletionTimeByLocation,
      averageCheckinCompletionTimeTotal,
      averageTimeTakenToCompleteCheckinReviewByLocation,
      averageTimeTakenToCompleteCheckinReviewTotal,
    })
  } catch (error) {
    next(error)
  }
}

export default renderDataDashboard
