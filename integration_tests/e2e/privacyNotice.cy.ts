import Page from '../pages/page'
import PrivacyPolicyPage from '../pages/privacyPolicePage'

context('Privacy notice', () => {
  it('shows the privacy notice without authentication', () => {
    cy.visit('/privacy-notice')
    Page.verifyOnPage(PrivacyPolicyPage)
  })
})
