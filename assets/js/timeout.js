function SessionTimeOutModal() {
  this.modal = null
  this.modalId = 'es-session-timeout-modal'
  this.inactivityCountdownTime = document.body.dataset.timeout || 0.1 // minutes
  this.modalCountdownTime = document.body.dataset.modalcount || 300 // seconds
  this.modalTimeout = null
  this.urls = {
    renew: '/session/keepalive',
    logout: '/session/timeout',
  }
  this.modalHtml = `
        <div class="es-modal" role="dialog" aria-modal="true" id="${this.modalId}">
            <div class="es-modal__body" tabindex="0">
                <h2 class="govuk-heading-m">You’re about to be signed out</h2>
                <p class="govuk-body">For your security, we will sign you out in <strong>${this.formatTime(this.modalCountdownTime)}</strong>.</p>
                <div class="es-modal__actions govuk-button-group">
                    <button class="govuk-button" id="es-timeout-action-renew">Stay signed in</button>
                    <a class="govuk-link" id="es-timeout-action-logout" href="#" role="button">Sign out</a>
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
  const logoutButton = document.getElementById('es-timeout-action-logout')
  renewButton.addEventListener('click', this.renewSession.bind(this))
  logoutButton.addEventListener('click', this.logout.bind(this))
}

SessionTimeOutModal.prototype.startModalCountdown = function startModalCountdown() {
  let countdownTime = this.modalCountdownTime
  const countdownDisplay = this.modal.getElementsByTagName('strong')[0]
  this.modalTimeout = setInterval(() => {
    countdownTime -= 1
    countdownDisplay.textContent = `${this.formatTime(countdownTime)}`
    if (countdownTime <= 0) {
      clearInterval(this.modalTimeout)
      this.logout('autoSignOut')
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
        console.error('Failed to renew session')
      }
    })
    .catch(error => console.error('Error:', error))
}

SessionTimeOutModal.prototype.hideModal = function hideModal() {
  clearInterval(this.modalTimeout)
  this.modal.remove()
}

SessionTimeOutModal.prototype.logout = function logout(action) {
  window.location.href = this.urls.logout
}

document.addEventListener('DOMContentLoaded', function () {
  const sessionTimeOutModal = new SessionTimeOutModal()
  sessionTimeOutModal.init()
})
