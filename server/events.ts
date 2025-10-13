import { defaultClient as appInsights } from 'applicationinsights'

const trackSubmissionEvent = (eventName: string, submissionId: string): void => {
  appInsights.trackEvent({ name: eventName, properties: { submissionId } })
}

export const submissionStarted = (submissionId: string): void => {
  trackSubmissionEvent('esup.submission.started', submissionId)
}

export const submissionVerified = (submissionId: string): void => {
  trackSubmissionEvent('esup.submission.verified', submissionId)
}

export const submissionSurveyCompleted = (submissionId: string): void => {
  trackSubmissionEvent('esup.submission.survey.completed', submissionId)
}

export const submissionCompleted = (submissionId: string): void => {
  trackSubmissionEvent('esup.submission.completed', submissionId)
}
