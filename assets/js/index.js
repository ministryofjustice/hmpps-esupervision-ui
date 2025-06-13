import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'

govukFrontend.initAll()
mojFrontend.initAll()

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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      video.srcObject = stream
      video.muted = true
      video.autoplay = true

      mediaRecorder = new MediaRecorder(stream)
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
        const blob = new Blob(recordedChunks, { type: 'video/mp4' })
        video.style.display = 'none'

        console.log(blob)

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
