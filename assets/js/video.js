class Controls {
  constructor(module) {
    this.startButton = module.querySelector('.videoRecorder__startButton')
    this.stopButton = module.querySelector('.videoRecorder__stopButton')
    this.panes = {
      record: document.getElementById('video-pane-record'),
      match: document.getElementById('video-pane-match'),
      nomatch: document.getElementById('video-pane-nomatch'),
      loading: document.getElementById('video-pane-loading'),
    }
  }

  show(name) {
    this.showPane(name)
    Object.keys(this.panes).forEach(key => {
      if (key !== name) {
        this.hidePane(key)
      }
    })
  }

  showPane(key) {
    const pane = this.panes[key]
    pane.classList.remove('es-pane--hidden')
    pane.setAttribute('aria-hidden', 'false')
    pane.focus()
  }

  hidePane(key) {
    const pane = this.panes[key]
    pane.classList.add('es-pane--hidden')
    pane.setAttribute('aria-hidden', 'true')
  }

  showRecord() {
    this.show('record')
  }

  showMatch() {
    this.show('match')
  }

  showNoMatch() {
    this.show('nomatch')
  }

  showLoading() {
    this.show('loading')
  }
}

export default function VideoRecorder(module) {
  this.controls = new Controls(module)
  this.videoContainer = module.querySelector('.videoRecorder__container')
  this.videoError = module.querySelector('.videoRecorder__error')
  this.video = module.querySelector('.videoRecorder__video')
  this.tag = module.querySelector('.videoRecorder__tag')
  this.videoPreviews = document.querySelectorAll('.videoRecorder__video-preview')
  this.videoUploadUrl = module.dataset.videoUploadUrl
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
VideoRecorder.prototype.verifyVideo = verifyVideo
VideoRecorder.prototype.handleDataAvailable = handleDataAvailable
VideoRecorder.prototype.getVideoFrameAtTwoSeconds = getVideoFrameAtTwoSeconds

function init() {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: 'user' }, audio: false })
    .then(async stream => {
      this.stream = stream
      this.video.srcObject = stream
      await this.video.play()
      this.videoError.style.display = 'none'
      this.controls.startButton.disabled = false
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
    this.mediaRecorder = await new MediaRecorder(this.stream, { mimeType: 'video/mp4' })
  } catch (e) {
    console.error('MediaRecorder not supported:', e) // eslint-disable-line no-console
  }
  this.controls.startButton.disabled = true
  this.tag.innerHTML = 'Recording'
  this.tag.style.display = 'flex'
  this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this)
  this.mediaRecorder.onstop = this.handleStop.bind(this)
  this.mediaRecorder.start(100)
  this.recordingDuration = 0

  this.recordingTimer = setInterval(() => {
    this.recordingDuration += 0.1

    if (this.recordingDuration >= 2) {
      this.controls.stopButton.disabled = false
      this.controls.stopButton.focus()
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
  canvas.getContext('2d').drawImage(this.video, 0, 0, canvas.width, canvas.height)

  // convert canvas image to blob
  this.videoFrame = await new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to extract frame'))
      }
    }, 'image/jpeg')
  })
}

async function stopRecording() {
  if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
    this.mediaRecorder.stop()
    clearInterval(this.recordingTimer)
    this.controls.startButton.disabled = false
    this.controls.showLoading()
  }
}

async function handleStop() {
  const videoBlob = new Blob(this.recordedChunks, { type: 'video/mp4' })
  this.videoPreviews.forEach(video => {
    const v = video
    v.src = URL.createObjectURL(videoBlob)
    v.controls = true
  })
  await this.verifyVideo()
}

function handleDataAvailable(event) {
  if (event.data.size > 0) {
    this.recordedChunks.push(event.data)
  }
}

async function uploadCheckinMedia({ uploadUrl, data }) {
  return fetch(uploadUrl, {
    method: 'PUT',
    body: data,
    headers: {
      'Content-Type': data.type,
    },
  })
}

async function verifyVideo() {
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
      const data = JSON.parse(ev.data)
      if (data.type === 'result') {
        events.close()
        if (data.result === 'MATCH') {
          this.controls.showMatch()
        } else {
          this.controls.showNoMatch()
        }
      }
    }
  } else {
    console.warn('No video or frame data to upload') // eslint-disable-line no-console
    this.controls.showNoMatch()
  }
}
