import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import { forEach } from 'lodash'
import VideoRecorder from './video'

govukFrontend.initAll()
mojFrontend.initAll()

const videoRecorder = document.querySelector('[data-module="videoRecorder"]')

const IMAGE_SESSION_KEY = 'esImageUpload'

const displayUploadedImage = document.getElementsByClassName('es-uploaded-image')
const uploadedImageData = localStorage.getItem(IMAGE_SESSION_KEY)

const photoUploadInput = document.getElementById('photoUpload-input')
const photoContentDisplay = document.getElementById('photoPreview')
const validationMessage = document.getElementById('photoUploadMessage')

const screenshot = document.getElementById('screenshot')
const registerButton = document.getElementById('registerButton')

if (videoRecorder) {
  new VideoRecorder(videoRecorder).initVideo()
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

// Display the uploaded image if it exists in localStorage and the container is present

if (displayUploadedImage && uploadedImageData) {
  const img = new Image()
  img.src = uploadedImageData
  img.alt = 'Uploaded image preview'
  img.classList.add('es-profile-image')

  img.onload = () => {
    forEach(displayUploadedImage, uploadedImageContainer => {
      const image = uploadedImageContainer
      image.innerHTML = ''
      image.appendChild(img)
    })
  }
}

// Handle the photo upload input change event

if (photoUploadInput) {
  // Photo upload input is present, clear any previous session data
  localStorage.removeItem(IMAGE_SESSION_KEY)
  photoUploadInput.addEventListener('change', handlePhotoSelection)
}

function handlePhotoSelection(event) {
  const file = event.target.files[0]
  photoContentDisplay.textContent = ''
  validationMessage.textContent = ''

  // Validate file attached
  if (!file) {
    showValidationMessage('Select an image file to upload')
    return
  }
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showValidationMessage('Select an image file, for example: .jpg, .jpeg, .png, .gif')
    return
  }

  // Read the image
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

      // Store the screenshot in localStorage
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
  registerButton.addEventListener('click', async () => {
    // Disable the button to prevent multiple submissions
    registerButton.setAttribute('disabled', 'disabled')

    const registerResult = await fetch(`/practitioners/register/details`, {
      method: 'GET',
    })
      .then(res => res.json())
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error)
        return { status: 'ERROR', message: `Registration failed` }
      })

    if (registerResult.status === 'SUCCESS') {
      const { url } = registerResult.uploadLocation
      // Upload the image to the provided URL
      const uploadImageResult = await fetch(url, {
        method: 'PUT',
        body: dataUrlToBlob(localStorage.getItem(IMAGE_SESSION_KEY).toString()),
        headers: {
          'Content-Type': 'image/jpeg',
        },
      })
      if (uploadImageResult) {
        // If the upload is successful, submit the form with the setup ID and clear the localStorage
        localStorage.removeItem(IMAGE_SESSION_KEY)
        document.getElementById('setupId').value = registerResult.setup.uuid
        document.getElementById('completeRegistrationForm').submit()
      }
    }
  })
}
