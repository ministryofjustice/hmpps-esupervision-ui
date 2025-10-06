import DashboardPage from '../../pages/practitioner/cases/dashboardPage'
import AuthManageDetailsPage from '../../pages/authManageDetailsPage'
import AuthSignInPage from '../../pages/authSignInPage'
import Page from '../../pages/page'

context('Sign In', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn', { roles: [''] })
    cy.task('stubOffenders')
    cy.task('stubOffenderCheckins')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Unauthenticated user navigating to sign in page directed to auth', () => {
    cy.visit('/sign-in')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.signIn({ failOnStatusCode: false })
    cy.task('stubVerifyToken', false)

    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User name visible in header', () => {
    cy.signIn({ failOnStatusCode: false })
    const dashboardPage = Page.verifyOnPage(DashboardPage)
    dashboardPage.headerUserName().should('contain.text', 'J. Smith')
  })

  it('Phase banner visible in header', () => {
    cy.signIn({ failOnStatusCode: false })
    const dashboardPage = Page.verifyOnPage(DashboardPage)
    dashboardPage.headerPhaseBanner().should('contain.text', 'Private Beta')
  })

  it('User can sign out', () => {
    cy.signIn({ failOnStatusCode: false })
    const dashboardPage = Page.verifyOnPage(DashboardPage)
    dashboardPage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User can manage their details', () => {
    cy.signIn({ failOnStatusCode: false })
    cy.task('stubAuthManageDetails')
    const dashboardPage = Page.verifyOnPage(DashboardPage)

    dashboardPage.manageDetails().get('a').invoke('removeAttr', 'target')
    dashboardPage.manageDetails().click()
    Page.verifyOnPage(AuthManageDetailsPage)
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.signIn({ failOnStatusCode: false })
    Page.verifyOnPage(DashboardPage)
    cy.task('stubVerifyToken', false)

    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Token verification failure clears user session', () => {
    cy.signIn({ failOnStatusCode: false })
    const dashboardPage = Page.verifyOnPage(DashboardPage)
    cy.task('stubVerifyToken', false)

    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)

    cy.task('stubVerifyToken', true)
    cy.task('stubSignIn', { name: 'Joe Bloggs' })

    cy.signIn({ failOnStatusCode: false })

    dashboardPage.headerUserName().contains('J. Bloggs')
  })
})
