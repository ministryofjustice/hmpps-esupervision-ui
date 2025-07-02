import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import VideoRecorder from './video'

govukFrontend.initAll()
mojFrontend.initAll()

const videoRecorder = document.querySelector('[data-module="videoRecorder"]')

if (videoRecorder) {
  new VideoRecorder(videoRecorder).init()
}

document.addEventListener('DOMContentLoaded', () => {
  async function capturePhoto(v) {
    const videoContainer = document.getElementById('es-photo-capture')
    const videoError = document.getElementById('es-photo-capture__error')
    const video = v

    if (videoContainer && video) {
      try {
        hide(videoError)
        show(videoContainer)

        const w = 345
        const h = 444

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        const constraints = { video: { width: w, height: h } }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        const takePhotoButton = document.getElementById('take-photo')
        const form = document.getElementById('photoForm')
        const photoDataField = document.getElementById('photoData')

        video.srcObject = stream
        await video.play()

        canvas.width = w
        canvas.height = h

        videoContainer.appendChild(canvas)

        if (takePhotoButton) {
          takePhotoButton.removeAttribute('disabled')
          takePhotoButton.addEventListener('click', async () => {
            context.drawImage(video, 0, 0, w, h)
            const dataUrl = canvas.toDataURL('image/jpeg')
            const img = document.createElement('img')
            img.src = dataUrl
            photoDataField.value = dataUrl
            videoContainer.innerHTML = ''
            videoContainer.appendChild(img)
            form.submit()
          })
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        show(videoError)
        hide(videoContainer)
      }
    }
  }

  const video = document.getElementById('es-photo-capture__video')

  if (video) {
    capturePhoto(video)
  }
})

const show = el => {
  const element = el
  element.classList.remove('es-hidden')
  element.classList.add('es-show')
  element.ariaHidden = false
}

const hide = el => {
  const element = el
  element.classList.remove('es-show')
  element.classList.add('es-hidden')
  element.ariaHidden = true
}
