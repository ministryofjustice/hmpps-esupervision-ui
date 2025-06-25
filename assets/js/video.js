export default function VideoRecorder(module) {
  this.videoContainer = module.querySelector('.videoRecorder__container')
  this.videoError = module.querySelector('.videoRecorder__error')
  this.video = module.querySelector('.videoRecorder__video')
  this.tag = module.querySelector('.videoRecorder__tag')
  this.videoPreview = module.querySelector('.videoRecorder__video-preview')
  this.startButton = module.querySelector('.videoRecorder__startButton')
  this.stopButton = module.querySelector('.videoRecorder__stopButton')
  this.videoControls = module.querySelector('.videoRecorder__controls')
  this.formControls = module.querySelector('.videoRecorder__form-controls')
  this.recordingTimer = null
  this.recordingDuration = 0
  this.mediaRecorder = null
  this.recordedChunks = []
  this.stream = null
}

VideoRecorder.prototype.init = init
VideoRecorder.prototype.startRecording = startRecording
VideoRecorder.prototype.stopRecording = stopRecording
VideoRecorder.prototype.handleStop = handleStop
VideoRecorder.prototype.handleDataAvailable = handleDataAvailable
VideoRecorder.prototype.getVideoFrameAtTwoSeconds = getVideoFrameAtTwoSeconds

function init() {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: 'user' }, audio: false })
    .then(stream => {
      this.stream = stream
      this.video.srcObject = stream
      this.video.play()
      this.videoError.style.display = 'none'
      this.startButton.addEventListener('click', this.startRecording.bind(this))
      this.stopButton.addEventListener('click', this.stopRecording.bind(this))
    })
    .catch(error => {
      console.error('Error accessing media devices:', error) // eslint-disable-line no-console
      this.videoContainer.style.display = 'none'
      this.videoError.style.display = 'block'
    })
}

function startRecording() {
  try {
    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'video/webm' })
  } catch (e) {
    console.error('MediaRecorder not supported:', e) // eslint-disable-line no-console
  }
  this.startButton.disabled = true
  this.tag.classList.add('govuk-tag--pink')
  this.tag.innerHTML = 'Recording'
  this.tag.style.display = 'flex'
  this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this)
  this.mediaRecorder.onstop = this.handleStop.bind(this)
  this.mediaRecorder.start(100)

  this.recordingTimer = setInterval(() => {
    this.recordingDuration += 0.1

    if (this.recordingDuration >= 2) {
      this.stopButton.disabled = false
      this.getVideoFrameAtTwoSeconds()
    }

    if (this.recordingDuration >= 5) {
      this.stopRecording()
    }
  }, 100)
}

function getVideoFrameAtTwoSeconds() {
  const canvas = document.createElement('canvas')
  canvas.width = this.video.videoWidth
  canvas.height = this.video.videoHeight
  canvas.getContext('2d').drawImage(this.video, 0, 0, canvas.width, canvas.height)

  const extractedFrameData = document.getElementById('extracted-frame-data')
  extractedFrameData.value = canvas.toDataURL('image/jpeg')
}

function stopRecording() {
  if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
    this.mediaRecorder.stop()
    clearInterval(this.recordingTimer)
    this.videoControls.style.display = 'none'
    this.formControls.style.display = 'block'
    this.tag.classList.remove('govuk-tag--pink')
    this.tag.innerHTML = 'Preview'
  }
}

function handleStop() {
  const videoBlob = new Blob(this.recordedChunks, { type: 'video/webm' })
  const recordedVideoData = document.getElementById('recorded-video-data')
  const reader = new FileReader()

  reader.readAsDataURL(videoBlob)
  reader.onloadend = () => {
    recordedVideoData.value = reader.result

    this.videoPreview.src = URL.createObjectURL(videoBlob)
    this.videoPreview.controls = true

    this.videoPreview.style.display = 'block'
    this.video.style.display = 'none'
  }
}

function handleDataAvailable(event) {
  if (event.data.size > 0) {
    this.recordedChunks.push(event.data)
  }
}
