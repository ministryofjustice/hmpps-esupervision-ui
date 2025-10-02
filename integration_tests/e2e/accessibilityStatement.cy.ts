import AccessibilityStatementPage from '../pages/accessibilityStatementPage'
import Page from '../pages/page'

context('Accessibility statement', () => {
  it('shows the accessibility statement without authentication', () => {
    cy.visit('/accessibility')
    Page.verifyOnPage(AccessibilityStatementPage)
  })
})
