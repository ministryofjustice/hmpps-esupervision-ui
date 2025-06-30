class Controls {
  constructor(module) {
    this.verifyButton = module.querySelector('.videoRecorder__verifyButton')
    this.continueButton = module.querySelector('.videoRecorder__continueButton')
    this.recordAgainButton = module.querySelector('.videoRecorder__recordAgainButton')
    this.formControlsContainer = this.continueButton.closest('.videoRecorder__form-controls')

    this.startButton = module.querySelector('.videoRecorder__startButton')
    this.stopButton = module.querySelector('.videoRecorder__stopButton')
    this.videoControlsContainer = this.startButton.closest('.videoRecorder__controls')
  }

  showFormControls() {
    this.formControlsContainer.style.display = 'block'
    this.videoControlsContainer.style.display = 'none'
  }

  showVideoControls() {
    this.formControlsContainer.style.display = 'none'
    this.videoControlsContainer.style.display = 'block'
  }
}

export default function VideoRecorder(module) {
  this.controls = new Controls(module)
  this.videoContainer = module.querySelector('.videoRecorder__container')
  this.videoError = module.querySelector('.videoRecorder__error')
  this.video = module.querySelector('.videoRecorder__video')
  this.tag = module.querySelector('.videoRecorder__tag')
  this.verificationError = module.querySelector('#verification-error')

  this.videoPreview = module.querySelector('.videoRecorder__video-preview')
  this.recordAgainClickHandler = _ => this.recordAgain()
  this.controls.recordAgainButton.addEventListener('click', _ => this.recordAgain())
  this.controls.verifyButton.addEventListener('click', ev => this.verifyClicked(ev))
  this.videoUploadUrl = module.dataset.videoUploadUrl
  // collect upload URLs from elem attributes
  this.frameUploadUrls = [...module.querySelectorAll('[data-frame-upload-url]')].map(
    elem => elem.dataset.frameUploadUrl,
  )
  this.submissionId = module.dataset.submissionId
  this.recordingTimer = null
  this.recordingDuration = 0
  this.mediaRecorder = null
  this.recordedChunks = []
  this.stream = null
  this.videoFrame = null
}

VideoRecorder.prototype.init = init
VideoRecorder.prototype.startRecording = startRecording
VideoRecorder.prototype.stopRecording = stopRecording
VideoRecorder.prototype.handleStop = handleStop
VideoRecorder.prototype.verifyClicked = verifyClicked
VideoRecorder.prototype.handleDataAvailable = handleDataAvailable
VideoRecorder.prototype.getVideoFrameAtTwoSeconds = getVideoFrameAtTwoSeconds
VideoRecorder.prototype.recordAgain = recordAgain

function init() {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: 'user' }, audio: false })
    .then(stream => {
      this.stream = stream
      this.video.srcObject = stream
      this.video.play()
      this.videoError.style.display = 'none'
      this.controls.startButton.addEventListener('click', _ => this.startRecording())
      this.controls.stopButton.addEventListener('click', _ => this.stopRecording())
    })
    .catch(error => {
      console.error('Error accessing media devices:', error) // eslint-disable-line no-console
      this.videoContainer.style.display = 'none'
      this.videoError.style.display = 'block'
    })
}

async function startRecording() {
  try {
    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'video/webm' })
  } catch (e) {
    console.error('MediaRecorder not supported:', e) // eslint-disable-line no-console
  }
  this.controls.startButton.disabled = true
  this.tag.classList.add('govuk-tag--pink')
  this.tag.innerHTML = 'Recording'
  this.tag.style.display = 'flex'
  this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this)
  this.mediaRecorder.onstop = this.handleStop.bind(this)
  this.mediaRecorder.start(100)

  if (this.videoPreview) {
    URL.revokeObjectURL(this.videoPreview.src)
  }
  this.recordingDuration = 0

  this.recordingTimer = setInterval(() => {
    this.recordingDuration += 0.1

    if (this.recordingDuration >= 2) {
      this.controls.stopButton.disabled = false
      this.getVideoFrameAtTwoSeconds()
    }

    if (this.recordingDuration >= 5) {
      this.stopRecording()
    }
  }, 100)
}

async function getVideoFrameAtTwoSeconds() {
  const canvas = document.createElement('canvas')
  canvas.width = this.video.videoWidth
  canvas.height = this.video.videoHeight
  // console.debug('extracting frame', { width: canvas.width, height: canvas.height })
  canvas.getContext('2d').drawImage(this.video, 0, 0, canvas.width, canvas.height)

  // convert canvas image to blob
  const frameBlob = await new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to extract frame'))
      }
    }, 'image/png')
  })
  this.videoFrame = frameBlob
}

function stopRecording() {
  if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
    this.mediaRecorder.stop()
    clearInterval(this.recordingTimer)
    this.controls.startButton.disabled = false
    this.controls.showFormControls()
    this.tag.classList.remove('govuk-tag--pink')
    this.tag.innerHTML = 'Preview'
  }
}

function handleStop() {
  const videoBlob = new Blob(this.recordedChunks, { type: 'video/mp4' })
  this.videoPreview.src = URL.createObjectURL(videoBlob)
  this.videoPreview.controls = true
  this.videoPreview.style.display = 'block'
  this.video.style.display = 'none'
}

function handleDataAvailable(event) {
  if (event.data.size > 0) {
    this.recordedChunks.push(event.data)
  }
}

function recordAgain() {
  this.controls.showVideoControls()

  // restore video
  this.videoPreview.style.display = 'none'
  this.video.style.display = 'block'
}

async function uploadCheckinMedia({ uploadUrl, data }) {
  const uploadResult = await fetch(uploadUrl, {
    method: 'PUT',
    body: data,
    headers: {
      'Content-Type': data.type,
    },
  })
  return uploadResult
}

async function verifyClicked(_) {
  // we upload the video and extracted frame(s)
  if (this.videoFrame && this.recordedChunks.length > 0) {
    const videoUploadPromise = uploadCheckinMedia({
      uploadUrl: this.videoUploadUrl,
      data: new Blob(this.recordedChunks, { type: 'video/mp4' }),
    })
    const frameUploadPromises = []
    for (const frameUrl of this.frameUploadUrls) {
      const frameUploadPromise = uploadCheckinMedia({ uploadUrl: frameUrl, data: this.videoFrame })
      frameUploadPromises.push(frameUploadPromise)
    }

    const [videoUpload, ...frameUploads] = await Promise.allSettled([videoUploadPromise, ...frameUploadPromises])
    if (videoUpload.status === 'rejected') {
      console.warn('Video upload failed', { url: this.videoUploadUrl, error: videoUpload.error }) // eslint-disable-line no-console
    }
    for (let index = 0; index < frameUploads.length; index += 1) {
      const frameUpload = frameUploads[index]
      if (frameUpload.status === 'rejected') {
        console.warn('Frame upload failed', { url: this.frameUploadUrls[index], error: frameUpload.error }) // eslint-disable-line no-console
      }
    }

    const events = new EventSource(`/submission/${this.submissionId}/video/verify`)
    events.onmessage = ev => {
      // console.log('EventSource message', ev)
      const data = JSON.parse(ev.data)
      if (data.type === 'result') {
        events.close()
        alert(`Face verification result: ${data.result}`) // eslint-disable-line no-alert
        this.controls.continueButton.disabled = false
      }
    }
  }
}
