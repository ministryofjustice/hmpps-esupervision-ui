import { format, parseISO } from 'date-fns'
import AutomatedIdVerificationResult from '../../../server/data/models/automatedIdVerificationResult'
import CheckinStatus from '../../../server/data/models/checkinStatus'
import { createMockCheckin, createMockOffender } from '../../mockApis/esupervisionApi'
import Page from '../../pages/page'
import CheckinReviewPage from '../../pages/practitioner/reviewCheckins/checkinReviewPage'
import Checkin from '../../../server/data/models/checkin'

describe('Reviewing a check-in', () => {
  context('A submitted check-in that needs review', () => {
    let mockCheckin: Checkin

    beforeEach(() => {
      const offender = createMockOffender({ firstName: 'John', lastName: 'Smith' })
      mockCheckin = createMockCheckin(offender, {
        status: CheckinStatus.Submitted,
        autoIdCheck: AutomatedIdVerificationResult.NoMatch,
      })
      cy.task('reset')
      cy.task('stubSignIn', { roles: [''] })
      cy.task('stubOffenders')
      cy.task('stubOffenderCheckins')
      cy.task('stubGetCheckin', mockCheckin)
      cy.task('stubReviewCheckin', mockCheckin)
      cy.signIn({ failOnStatusCode: false })
    })

    it('should display the details of a submitted check-in', () => {
      cy.visit(`/practitioners/checkin/${mockCheckin.uuid}`)
      const reviewPage = Page.verifyOnPage(CheckinReviewPage)
      reviewPage.heading().should('contain.text', 'John Smith')
      reviewPage.verifySummaryValue('Status', 'Checked in')
      if (mockCheckin.submittedAt) {
        const formattedDateTime = format(parseISO(mockCheckin.submittedAt), "d MMMM yyyy', ' h:mmaaa")
        reviewPage.verifySummaryValue('Checked in on', formattedDateTime)
      }

      if (mockCheckin.reviewDueDate) {
        const formattedReviewDate = format(parseISO(mockCheckin.reviewDueDate), 'd MMMM yyyy')
        reviewPage.verifySummaryValue('Review due', formattedReviewDate)
      }
      reviewPage.idVerificationYesRadio().should('exist')
      reviewPage.markAsReviewedButton().should('exist')
      reviewPage.idVerificationYesRadio().click()
      reviewPage.markAsReviewedButton().click()
      cy.url().should('include', '/practitioners/dashboard')
    })
  })
})
