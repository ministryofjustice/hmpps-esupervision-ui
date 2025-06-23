export default function VideoRecorder(module) {
  this.videoWrap = module.querySelector('.videoRecorder__videoWrap')
  this.videoError = module.querySelector('.videoRecorder__error')
  this.video = module.querySelector('.videoRecorder__video')
  this.stream = null
}

// VideoRecorder.prototype.init = function () {}
