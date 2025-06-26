import LocationInfo from './locationInfo'

export default class UploadLocationResponse {
  locationInfo?: LocationInfo

  locations?: LocationInfo[]

  errorMessage?: string
}
