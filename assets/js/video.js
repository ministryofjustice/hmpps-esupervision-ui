const videoContainer = document.getElementById('videoContainer')
const { videoUploadUrl, imageUploadUrl, submissionId } = videoContainer.dataset
const video = document.getElementById('video')
const canvas = document.getElementById('canvas')
const startBtn = document.getElementById('startBtn')
const statusTag = document.getElementById('statusTag')
const recordingScreen = document.getElementById('recordingScreen')
const errorMessage = document.getElementById('errorMessage')
const loadingScreen = document.getElementById('loadingScreen')
const matchScreen = document.getElementById('matchScreen')
const matchPreview = document.getElementById('matchPreview')
const noMatchScreen = document.getElementById('noMatchScreen')
const noMatchPreview = document.getElementById('noMatchPreview')
const errorScreen = document.getElementById('errorScreen')

let mediaRecorder
let recordedChunks = []
let screenshotBlob = null

const videoFormat = 'video/mp4'
const imageFormat = 'image/jpeg'
const screenShotTime = 2000 // 2 seconds
const maximumRecordingTime = 5000 // 5 seconds
const loadingScreenDelay = 3000 // 3 seconds

const screens = {
  record: recordingScreen,
  match: matchScreen,
  noMatch: noMatchScreen,
  loading: loadingScreen,
  error: errorScreen,
}

async function initVideo() {
  try {
    showScreen('record')
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
    video.srcObject = stream
    mediaRecorder = new MediaRecorder(stream)
    mediaRecorder.ondataavailable = e => recordedChunks.push(e.data)
    mediaRecorder.onstop = handleRecordingComplete
    startBtn.disabled = false
  } catch (error) {
    console.error('Error accessing media devices:', error) // eslint-disable-line no-console
    videoContainer.hidden = true
    errorMessage.hidden = false
  }
}

startBtn.addEventListener('click', () => {
  startBtn.disabled = true
  statusTag.textContent = `Recording... ${maximumRecordingTime / 1000}s remaining`
  statusTag.style.display = 'flex'

  recordedChunks = []
  mediaRecorder.start()

  // Screenshot at 2s
  setTimeout(captureScreenshot, screenShotTime)

  // Countdown tag
  let seconds = maximumRecordingTime / 1000
  const interval = setInterval(() => {
    seconds -= 1
    if (seconds > 0) {
      statusTag.textContent = `Recording... ${seconds}s remaining`
    } else {
      clearInterval(interval)
    }
  }, 1000)

  // Stop at 5s
  setTimeout(() => {
    if (mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
    }
  }, maximumRecordingTime)
})

function captureScreenshot() {
  const ctx = canvas.getContext('2d')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  canvas.toBlob(blob => {
    screenshotBlob = blob
  }, imageFormat)
}

function handleRecordingComplete() {
  const videoBlob = new Blob(recordedChunks, { type: videoFormat })
  const videoURL = URL.createObjectURL(videoBlob)

  showScreen('loading')

  const startTime = Date.now()

  uploadAndRecognition(videoBlob, screenshotBlob).then(result => {
    const elapsed = Date.now() - startTime
    const delay = Math.max(0, loadingScreenDelay - elapsed)

    setTimeout(() => {
      if (result === 'MATCH') {
        matchPreview.src = videoURL
        showScreen('match')
      } else if (result === 'NO_MATCH') {
        noMatchPreview.src = videoURL
        showScreen('noMatch')
      } else {
        showScreen('error')
      }
    }, delay)
  })
}

async function uploadFile({ url, data }) {
  return fetch(url, {
    method: 'PUT',
    body: data,
    headers: {
      'Content-Type': data.type,
    },
  })
}

async function uploadAndRecognition(videoClip, screenShot) {
  const screenShotPromise = uploadFile({
    url: imageUploadUrl,
    data: screenShot,
  })

  const videoClipPromise = uploadFile({
    url: videoUploadUrl,
    data: videoClip,
  })

  const faceRecognitionResult = await fetch(`/submission/${submissionId}/video/verify`)
    .then(res => res.json())
    .catch(e => () => {
      return new Promise(resolve => {
        resolve('ERROR', e)
      })
    })

  const [videoUpload, imageUpload] = await Promise.allSettled([
    videoClipPromise,
    screenShotPromise,
    faceRecognitionResult,
  ])

  if (videoUpload.status === 'rejected') {
    console.warn('Video upload failed', { url: videoUploadUrl, error: videoUpload.error }) // eslint-disable-line no-console
  }

  if (imageUpload.status === 'rejected') {
    console.warn('Frame upload failed', { url: imageUploadUrl, error: imageUpload.error }) // eslint-disable-line no-console
  }

  return new Promise(resolve => {
    if (faceRecognitionResult.status === 'SUCCESS') {
      resolve(faceRecognitionResult.result)
    } else {
      resolve('ERROR')
    }
  })
}

const hideAllScreens = () => {
  Object.values(screens).forEach(screen => {
    const s = screen
    s.hidden = true
  })
}

const showScreen = screen => {
  hideAllScreens()
  screens[screen].hidden = false
}

initVideo()
