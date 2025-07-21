import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import { forEach } from 'lodash'
import VideoRecorder from './video'

govukFrontend.initAll()
mojFrontend.initAll()

const videoRecorder = document.querySelector('[data-module="videoRecorder"]')

if (videoRecorder) {
  new VideoRecorder(videoRecorder).initVideo()
}

const IMAGE_SESSION_KEY = 'esImageUpload'

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
            localStorage.setItem(IMAGE_SESSION_KEY, dataUrl)
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

const displayUploadedImage = document.getElementsByClassName('es-uploaded-image')
const uploadedImageData = localStorage.getItem(IMAGE_SESSION_KEY)

if (displayUploadedImage && uploadedImageData) {
  const img = new Image()
  img.src = uploadedImageData
  img.alt = 'Uploaded image preview'
  img.classList.add('es-profile-image')

  img.onload = () => {
    forEach(displayUploadedImage, uploadedImageContainer => {
      const uploadedImage = uploadedImageContainer
      uploadedImage.innerHTML = ''
      uploadedImage.appendChild(img)
    })
  }
}

const photoUploadInput = document.getElementById('photoUpload-input')
const photoContentDisplay = document.getElementById('photoPreview')
const validationMessage = document.getElementById('photoUploadMessage')

const screenshot = document.getElementById('screenshot')

if (photoUploadInput) {
  photoUploadInput.addEventListener('change', handlePhotoSelection)
}

function handlePhotoSelection(event) {
  const file = event.target.files[0]
  photoContentDisplay.textContent = ''
  validationMessage.textContent = ''

  // Validate file existence and type
  if (!file) {
    showValidationMessage('Select an image file to upload')
    return
  }

  if (!file.type.startsWith('image/')) {
    showValidationMessage('Select an image file, for example: .jpg, .jpeg, .png, .gif')
    return
  }

  // Read the file
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      photoContentDisplay.innerHTML = ''
      photoContentDisplay.appendChild(img)

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, img.width, img.height)

      const screenshotDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      // Store the photo in localStorage
      localStorage.setItem(IMAGE_SESSION_KEY, screenshotDataUrl)

      const screenshotImg = new Image()
      screenshotImg.src = screenshotDataUrl
      screenshot.innerHTML = ''
      screenshot.appendChild(screenshotImg)
    }
    img.src = reader.result.toString()
  }
  reader.onerror = () => {
    showValidationMessage('Error reading the file, try again')
  }
  reader.readAsDataURL(file)
}

function showValidationMessage(message) {
  validationMessage.textContent = message
}

const uploadedImage = document.getElementById('es-uploaded-image')

if (uploadedImage && uploadedImageData) {
  const img = new Image()
  img.src = uploadedImageData
  img.alt = 'Uploaded image preview'
  img.classList.add('es-profile-image')

  img.onload = () => {
    uploadedImage.innerHTML = ''
    uploadedImage.appendChild(img)
  }
}

const registerButton = document.getElementById('registerButton')

if (registerButton) {
  registerButton.addEventListener('click', async () => {
    registerButton.setAttribute('disabled', 'disabled')
    const registerResult = await fetch(`/practitioners/register/details`, {
      method: 'GET',
    })
      .then(res => res.json())
      .catch(error => {
        console.error(error)
        return { status: 'ERROR', message: `Registration failed` }
      })

    if (registerResult.status === 'SUCCESS') {
      const { url } = registerResult.uploadLocation
      const uploadImageResult = await fetch(url, {
        method: 'PUT',
        body: dataUrlToBlob(localStorage.getItem(IMAGE_SESSION_KEY).toString()),
        headers: {
          'Content-Type': 'image/jpeg',
        },
      })
      if (uploadImageResult) {
        const completeRegistration = await fetch(`/practitioners/register/complete/${registerResult.setup.uuid}`, {
          method: 'GET',
        })
        if (completeRegistration.ok) {
          window.location.href = '/practitioners/dashboard'
        } else {
          // eslint-disable-next-line no-console
          console.error('Failed to complete registration')
        }
      }
    }
  })
}

const dataUrlToBlob = dataUrl => {
  const [info, data] = dataUrl.split(',')
  const mime = info.match(/:(.*?);/)[1]
  const byteString = atob(data)
  const bytes = new Uint8Array(byteString.length)

  for (let i = 0; i < byteString.length; i += 1) {
    bytes[i] = byteString.charCodeAt(i)
  }

  return new Blob([bytes], { type: mime })
}
