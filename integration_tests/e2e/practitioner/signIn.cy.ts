import IndexPage from '../../pages'
import AuthManageDetailsPage from '../../pages/authManageDetails'
import AuthSignInPage from '../../pages/authSignIn'
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
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.headerUserName().should('contain.text', 'J. Smith')
  })

  it('Phase banner visible in header', () => {
    cy.signIn({ failOnStatusCode: false })
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.headerPhaseBanner().should('contain.text', 'Private Beta')
  })

  it('User can sign out', () => {
    cy.signIn({ failOnStatusCode: false })
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User can manage their details', () => {
    cy.signIn({ failOnStatusCode: false })
    cy.task('stubAuthManageDetails')
    const indexPage = Page.verifyOnPage(IndexPage)

    indexPage.manageDetails().get('a').invoke('removeAttr', 'target')
    indexPage.manageDetails().click()
    Page.verifyOnPage(AuthManageDetailsPage)
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.signIn({ failOnStatusCode: false })
    Page.verifyOnPage(IndexPage)
    cy.task('stubVerifyToken', false)

    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Token verification failure clears user session', () => {
    cy.signIn({ failOnStatusCode: false })
    const indexPage = Page.verifyOnPage(IndexPage)
    cy.task('stubVerifyToken', false)

    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)

    cy.task('stubVerifyToken', true)
    cy.task('stubSignIn', { name: 'bobby brown' })

    cy.signIn({ failOnStatusCode: false })

    indexPage.headerUserName().contains('B. Brown')
  })
})
