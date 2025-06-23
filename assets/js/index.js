import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'

govukFrontend.initAll()
mojFrontend.initAll()

// const videoRecorder = document.querySelector('[data-module="videoRecorder"]')

// if (videoRecorder) {
//   new VideoRecorder(videoRecorder).init()
// }

document.addEventListener('DOMContentLoaded', () => {
  const videoWrap = document.getElementById('es-video-check-in')
  const video = document.getElementById('es-video-check-in__video')
  const preview = document.getElementById('es-video-check-in__preview')
  const startRecordButton = document.getElementById('start-recording')
  const stopRecordButton = document.getElementById('stop-recording')
  const status = document.getElementById('es-video-check-in__status')
  const controls = document.getElementById('es-video-check-in__controls')
  const navigation = document.getElementById('es-video-check-in__navigation')

  let mediaRecorder
  let recordedChunks = []

  const showUserError = () => {
    const errorMessage = document.createElement('div')
    errorMessage.className = 'govuk-error-message'
    errorMessage.innerHTML =
      '<span class="govuk-visually-hidden">Error:</span> We are unable to access camera. We need your camera to record a check-in video. Check your browser settings and permissions.'
    videoWrap.parentNode.insertBefore(errorMessage, videoWrap)
    videoWrap.style.display = 'none'
  }

  async function startVideoStream() {
    stopRecordButton.disabled = true
    preview.style.display = 'none'
    status.style.display = 'none'
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      video.srcObject = stream
      video.muted = true
      video.autoplay = true

      mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' })
      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data)
        }
      }

      mediaRecorder.onstart = async () => {
        status.classList.add('govuk-tag--pink')
        status.innerHTML = 'Recording'
        status.style.display = 'flex'
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' })
        video.style.display = 'none'

        const formData = new FormData()
        formData.append('video', blob, 'check-in-video.mp4')

        const url = URL.createObjectURL(blob)

        preview.src = url
        preview.autoplay = false
        preview.style.display = 'block'
        preview.controls = true

        status.classList.remove('govuk-tag--pink')
        status.innerHTML = 'Preview'

        controls.style.display = 'none'
        navigation.style.display = 'block'

        // Save the video
      }
    } catch (error) {
      console.error('Error accessing camera:', error) // eslint-disable-line no-console
      showUserError()
    }
  }

  if (startRecordButton && stopRecordButton) {
    startRecordButton.addEventListener('click', () => {
      recordedChunks = []
      mediaRecorder.start()
      startRecordButton.disabled = true
      stopRecordButton.disabled = false
    })

    stopRecordButton.addEventListener('click', () => {
      mediaRecorder.stop()
      startRecordButton.disabled = false
      stopRecordButton.disabled = true
    })

    startVideoStream()
  }
})

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

        video.srcObject = stream
        video.play()

        canvas.width = w
        canvas.height = h

        videoContainer.appendChild(canvas)

        if (takePhotoButton) {
          takePhotoButton.addEventListener('click', async () => {
            context.drawImage(video, 0, 0, w, h)
            const dataUrl = canvas.toDataURL('image/jpeg')
            const img = document.createElement('img')
            img.src = dataUrl
            videoContainer.innerHTML = ''
            videoContainer.appendChild(img)

            window.location.href = '/practitioners/register/photo/review'
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
