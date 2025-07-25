export default function VideoRecorder() {
  this.videoContainer = document.getElementById('videoContainer')
  const { videoUploadUrl, imageUploadUrl, submissionId } = this.videoContainer.dataset
  this.urls = { videoUploadUrl, imageUploadUrl, submissionId }
  this.video = document.getElementById('video')
  this.canvas = document.getElementById('canvas')
  this.startBtn = document.getElementById('startBtn')
  this.statusTag = document.getElementById('statusTag')
  this.recordingScreen = document.getElementById('recordingScreen')
  this.errorMessage = document.getElementById('errorMessage')
  this.loadingScreen = document.getElementById('loadingScreen')
  this.matchScreen = document.getElementById('matchScreen')
  this.matchPreview = document.getElementById('matchPreview')
  this.noMatchScreen = document.getElementById('noMatchScreen')
  this.noMatchPreview = document.getElementById('noMatchPreview')
  this.errorScreen = document.getElementById('errorScreen')

  this.mediaRecorder = null
  this.recordedChunks = []
  this.screenshotBlob = null

  this.videoFormat = 'video/mp4'
  this.imageFormat = 'image/jpeg'
  this.screenShotTime = 2000 // 2 seconds
  this.maximumRecordingTime = 5000 // 5 seconds
  this.loadingScreenDelay = 3000 // 3 seconds

  this.screens = {
    record: this.recordingScreen,
    match: this.matchScreen,
    noMatch: this.noMatchScreen,
    loading: this.loadingScreen,
    error: this.errorScreen,
  }
}

VideoRecorder.prototype.initVideo = initVideo
VideoRecorder.prototype.captureScreenshot = captureScreenshot
VideoRecorder.prototype.handleRecordingComplete = handleRecordingComplete
VideoRecorder.prototype.uploadFile = uploadFile
VideoRecorder.prototype.uploadAndRekognition = uploadAndRekognition
VideoRecorder.prototype.showScreen = showScreen
VideoRecorder.prototype.hideAllScreens = hideAllScreens

async function initVideo() {
  try {
    this.showScreen('record')
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
    this.video.srcObject = stream
    this.mediaRecorder = new MediaRecorder(stream)
    this.mediaRecorder.ondataavailable = e => this.recordedChunks.push(e.data)
    this.mediaRecorder.onstop = this.handleRecordingComplete.bind(this)
    this.startBtn.disabled = false
  } catch (error) {
    console.error('Error accessing media devices:', error) // eslint-disable-line no-console
    this.videoContainer.hidden = true
    this.errorMessage.hidden = false
  }

  this.startBtn.addEventListener('click', () => {
    this.startBtn.disabled = true
    this.statusTag.textContent = `Recording... ${this.maximumRecordingTime / 1000}s remaining`
    this.statusTag.style.display = 'flex'

    this.recordedChunks = []
    this.mediaRecorder.start()

    // Screenshot at 2s
    setTimeout(this.captureScreenshot.bind(this), this.screenShotTime)

    // Countdown tag
    let seconds = this.maximumRecordingTime / 1000
    const interval = setInterval(() => {
      seconds -= 1
      if (seconds > 0) {
        this.statusTag.textContent = `Recording... ${seconds}s remaining`
      } else {
        clearInterval(interval)
      }
    }, 1000)

    // Stop at 5s
    setTimeout(() => {
      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop()
      }
    }, this.maximumRecordingTime)
  })
}

function captureScreenshot() {
  const ctx = this.canvas.getContext('2d')
  this.canvas.width = this.video.videoWidth
  this.canvas.height = this.video.videoHeight
  ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height)
  this.canvas.toBlob(blob => {
    this.screenshotBlob = blob
  }, this.imageFormat)
}

function handleRecordingComplete() {
  const videoBlob = new Blob(this.recordedChunks, { type: this.videoFormat })
  const videoURL = URL.createObjectURL(videoBlob)

  this.showScreen('loading')

  const startTime = Date.now()
  this.uploadAndRekognition(videoBlob, this.screenshotBlob).then(result => {
    const elapsed = Date.now() - startTime

    // Calculate delay based on elapsed time of upload and processing
    // If the files uploads and Rekognition takes longer than the loading screen delay (3 seconds), show immediately
    const delay = Math.max(0, this.loadingScreenDelay - elapsed)

    // Delay the loading screen to simulate processing time
    // Hide loading screen after the delay - show match or no match screen
    setTimeout(() => {
      if (result === 'MATCH') {
        this.matchPreview.src = videoURL
        this.showScreen('match')
      } else if (result === 'NO_MATCH') {
        this.noMatchPreview.src = videoURL
        this.showScreen('noMatch')
      } else {
        console.warn('Unexpected error: ', result.message) // eslint-disable-line no-console
        this.showScreen('error')
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

async function uploadAndRekognition(videoClip, screenShot) {
  const screenShotPromise = this.uploadFile({
    url: this.urls.imageUploadUrl,
    data: screenShot,
  })

  const videoClipPromise = this.uploadFile({
    url: this.urls.videoUploadUrl,
    data: videoClip,
  })

  const [videoUpload, imageUpload] = await Promise.allSettled([videoClipPromise, screenShotPromise])

  if (imageUpload.status === 'rejected') {
    return { status: 'ERROR', message: 'Screenshot upload failed' }
  }

  if (videoUpload.status === 'rejected') {
    return { status: 'ERROR', message: 'Video upload failed' }
  }

  const faceRecognitionResult = await fetch(`/submission/${this.urls.submissionId}/video/verify`)
    .then(res => res.json())
    .catch(error => {
      return { status: 'ERROR', message: `Face recognition request failed - ${error.message}` }
    })

  if (faceRecognitionResult.status === 'SUCCESS') {
    return faceRecognitionResult.result
  }

  return { status: 'ERROR', message: 'Unable to verify photo or video' }
}

function hideAllScreens() {
  Object.values(this.screens).forEach(screen => {
    const s = screen
    s.hidden = true
  })
}

function showScreen(screen) {
  this.hideAllScreens()
  this.screens[screen].hidden = false
}
