import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import { forEach } from 'lodash'
import VideoRecorder from './video'

govukFrontend.initAll()
mojFrontend.initAll()

const videoRecorder = document.querySelector('[data-module="videoRecorder"]')

const IMAGE_CONTENT_TYPE = 'image/jpeg'
const IMAGE_SESSION_KEY = 'esImageUpload'

const displayUploadedImage = document.getElementsByClassName('es-uploaded-image')
const uploadedImageData = localStorage.getItem(IMAGE_SESSION_KEY)

const photoUploadInput = document.getElementById('photoUpload-input')
const photoContentDisplay = document.getElementById('photoPreview')
const validationMessage = document.getElementById('photoUploadMessage')

const registerButton = document.getElementById('registerButton')

if (videoRecorder) {
  new VideoRecorder(videoRecorder).initVideo()
}

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

      video.srcObject = stream
      await video.play()

      canvas.width = w
      canvas.height = h

      videoContainer.appendChild(canvas)

      if (takePhotoButton) {
        takePhotoButton.removeAttribute('disabled')
        takePhotoButton.addEventListener('click', async () => {
          context.drawImage(video, 0, 0, w, h)
          const dataUrl = canvas.toDataURL(IMAGE_CONTENT_TYPE)
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

document.addEventListener('DOMContentLoaded', () => {
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

// Display the uploaded image if it exists in localStorage and the container is present

if (displayUploadedImage && uploadedImageData) {
  if (displayUploadedImage[0]) {
    const img = new Image()
    img.src = uploadedImageData
    img.alt = `Image of ${displayUploadedImage[0].dataset.person || 'the person'} added for identification`
    img.classList.add('es-profile-image')

    img.onload = () => {
      forEach(displayUploadedImage, uploadedImageContainer => {
        const image = uploadedImageContainer
        image.innerHTML = ''
        image.appendChild(img)
      })
    }
  }
}

// If registration personal details page, and has 'start' query string is present
if (document.getElementById('registerPoPStartPage')) {
  const url = new URL(window.location.href)
  // Remove any existing image from localStorage
  localStorage.removeItem(IMAGE_SESSION_KEY)
  // Remove the 'start' query string from the URL
  window.history.replaceState({}, '', url.pathname)
}

// Handle the photo upload input change event
if (photoUploadInput) {
  photoUploadInput.addEventListener('change', handlePhotoSelection)
}

function handlePhotoSelection(event) {
  localStorage.removeItem(IMAGE_SESSION_KEY)
  const file = event.target.files[0]
  photoContentDisplay.textContent = ''
  if (validationMessage) {
    validationMessage.textContent = ''
  }

  // Validate file attached
  if (!file) {
    showValidationMessage('Select a photo of the person')
    return
  }
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showValidationMessage('The selected file must be a JPG, PNG, HEIF or GIF’.')
    return
  }

  // Read the image
  const reader = new FileReader()
  const img = new Image()
  reader.onload = () => {
    img.onload = () => {
      photoContentDisplay.innerHTML = ''
      photoContentDisplay.appendChild(img)

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, img.width, img.height)

      const screenshot = canvas.toDataURL(IMAGE_CONTENT_TYPE, 0.8)

      // Store the screenshot in localStorage
      localStorage.setItem(IMAGE_SESSION_KEY, screenshot)
    }
    img.src = reader.result.toString()

    const preview = document.querySelector('#photoPreview')
    if (preview) {
      preview.innerHTML = ''
      preview.appendChild(img)
      preview.style.visibility = 'visible'
    }
  }
  reader.onerror = () => {
    showValidationMessage('Error reading the file, try again')
  }
  reader.readAsDataURL(file)
}

function showValidationMessage(message) {
  if (validationMessage) {
    validationMessage.textContent = message
  }
}

function dataUrlToBlob(dataUrl) {
  const [info, data] = dataUrl.split(',')
  const mime = info.match(/:(.*?);/)[1]
  const byteString = atob(data)
  const bytes = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i += 1) {
    bytes[i] = byteString.charCodeAt(i)
  }
  return new Blob([bytes], { type: mime })
}

// Handle the registration button click event on Check Your Answers page
if (registerButton) {
  registerButton.addEventListener('click', async event => {
    const button = event.target
    button.setAttribute('disabled', 'disabled')
    try {
      const registerResponse = await fetch('/practitioners/register/begin', {
        method: 'POST',
        headers: {
          'x-csrf-token': document.querySelector('input[name=_csrf]').value,
        },
      })

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text()
        throw Object.assign(new Error(`HTTP ${registerResponse.status} error`), {
          type: 'HTTP_ERROR',
          status: registerResponse.status,
          body: errorText,
        })
      }

      const result = await registerResponse.json()

      if (result.status !== 'SUCCESS') {
        throw Object.assign(new Error(result.message || 'Registration failed'), {
          type: 'API_ERROR',
          code: result.code || 'REGISTRATION_FAILED',
        })
      }

      const image = localStorage.getItem(IMAGE_SESSION_KEY)
      if (!image) {
        // eslint-disable-next-line no-console
        console.warn('Image not found in session storage')
        return
      }

      const { url } = result.uploadLocation
      const uploadImageResult = await fetch(url, {
        method: 'PUT',
        body: dataUrlToBlob(image),
        headers: {
          'Content-Type': IMAGE_CONTENT_TYPE,
        },
      })

      if (!uploadImageResult.ok) {
        const uploadError = await uploadImageResult.text()
        throw new Error(`Image upload failed: ${uploadImageResult.status} ${uploadError}`)
      }

      // Success: clear session, set hidden field, and submit form
      localStorage.removeItem(IMAGE_SESSION_KEY)
      document.getElementById('setupId').value = result.setup.uuid
      document.getElementById('completeRegistrationForm').submit()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Registration process error:', error)
      showRegistrationError(error.status)
    } finally {
      button.removeAttribute('disabled')
    }
  })
}

function showRegistrationError(statusCode) {
  let errorMessage = 'An error occurred during registration'
  if (statusCode === 422) {
    errorMessage = "The email address or phone number you've entered are already associated with another person"
  }
  const errorBanner = document.getElementById('registration-error')
  const errorBannerContent = document.getElementById('registration-error-content')
  if (errorBanner) {
    errorBannerContent.textContent = errorMessage
    errorBanner.removeAttribute('hidden')
    errorBanner.focus()
    errorBanner.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
