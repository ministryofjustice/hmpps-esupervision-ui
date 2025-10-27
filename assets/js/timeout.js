function SessionTimeOutModal(submissionId) {
  this.modal = null
  this.modalId = 'es-session-timeout-modal'
  this.inactivityCountdownTime = document.body.dataset.timeout || 30 // minutes
  this.modalCountdownTime = document.body.dataset.modalcount || 300 // seconds
  this.modalTimeout = null
  this.urls = {
    renew: `/submission/${submissionId}/keepalive`,
    logout: `/submission/${submissionId}/timeout`,
  }
  this.modalHtml = `
        <div class="es-modal" role="dialog" aria-modal="true" id="${this.modalId}" tabindex="-1">
            <div class="es-modal__body" tabindex="0">
                <h1 class="govuk-heading-m">You’re about to be signed out<span class="govuk-visually-hidden">.</span></h1>
                <p class="govuk-body">For your security, we will sign you out in <strong>${this.formatTime(this.modalCountdownTime)}</strong>.</p>
                <div class="es-modal__actions govuk-button-group">
                    <button class="govuk-button" id="es-timeout-action-renew" aria-label="Stay signed in">Stay signed in</button>
                    <span class="govuk-visually-hidden">or</span>
                    <a class="govuk-link govuk-link--no-visited-state" id="es-timeout-action-logout" href="${this.urls.logout}" aria-label="Sign out">Sign out</a>
                </div>
            </div>
        </div>`
}

SessionTimeOutModal.prototype.init = function init() {
  this.startInactivityCountdown()
}

SessionTimeOutModal.prototype.startInactivityCountdown = function startInactivityCountdown() {
  setTimeout(this.showModal.bind(this), this.inactivityCountdownTime * 60 * 1000)
}

SessionTimeOutModal.prototype.formatTime = function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds} seconds`
  }
  const minutes = Math.floor(seconds / 60)
  const minutesLabel = minutes === 1 ? 'minute' : 'minutes'
  const secs = seconds % 60
  const secsLabel = secs === 1 ? 'second' : 'seconds'
  return `${String(minutes)} ${minutesLabel} ${String(secs)} ${secsLabel}`
}

SessionTimeOutModal.prototype.showModal = function showModal() {
  document.body.insertAdjacentHTML('beforeend', this.modalHtml)
  this.modal = document.getElementById(this.modalId)
  this.modal.firstElementChild.focus()
  this.modalEvents()
  this.startModalCountdown()
}

SessionTimeOutModal.prototype.modalEvents = function modalEvents() {
  const renewButton = document.getElementById('es-timeout-action-renew')
  renewButton.addEventListener('click', this.renewSession.bind(this))
}

SessionTimeOutModal.prototype.startModalCountdown = function startModalCountdown() {
  let countdownTime = this.modalCountdownTime
  const countdownDisplay = this.modal.getElementsByTagName('strong')[0]
  this.modalTimeout = setInterval(() => {
    countdownTime -= 1
    countdownDisplay.textContent = `${this.formatTime(countdownTime)}`
    if (countdownTime <= 0) {
      clearInterval(this.modalTimeout)
      window.location.href = this.urls.logout
    }
  }, 1000)
}

SessionTimeOutModal.prototype.renewSession = function renewSession(e) {
  e.preventDefault()

  const button = e.target
  button.disabled = true

  fetch(this.urls.renew, {
    method: 'GET',
    credentials: 'include',
  })
    .then(response => {
      if (response.ok) {
        this.hideModal()
        this.startInactivityCountdown()
      } else {
        console.error('Failed to renew session') // eslint-disable-line no-console
      }
    })
    .catch(
      error => console.error('Error:', error), // eslint-disable-line no-console
    )
}

SessionTimeOutModal.prototype.hideModal = function hideModal() {
  clearInterval(this.modalTimeout)
  this.modal.remove()
}

document.addEventListener('DOMContentLoaded', function pageLoad() {
  const { submissionId } = document.body.dataset
  const sessionTimeOutModal = new SessionTimeOutModal(submissionId)
  sessionTimeOutModal.init()
})
