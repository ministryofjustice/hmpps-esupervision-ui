import Page, { PageElement } from '../../page'

export default class CheckinVideoPage extends Page {
  constructor() {
    super('Check in video')
  }

  videoPlayer = (): PageElement => cy.get('video.videoRecorder__video-preview')

  backToCheckinButton = (): PageElement => cy.get('a.govuk-button').contains('Back to check in')
}
