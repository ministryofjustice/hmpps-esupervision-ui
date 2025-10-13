import SubmissionPage, { PageElement } from '../submissionPage'

export default class VideoRecordPage extends SubmissionPage {
  constructor() {
    super('Record your video')
  }

  videoElement = (): PageElement => cy.get('#video')

  startRecordingButton = (): PageElement => cy.get('#startBtn')

  statusTag = (): PageElement => cy.get('#statusTag')
}
