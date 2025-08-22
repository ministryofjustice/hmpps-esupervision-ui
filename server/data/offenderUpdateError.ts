export default class OffenderUpdateError extends Error {
  message: string

  status: number

  /**
   *
   */
  constructor(message: string, status: number) {
    super(message)
    this.message = 'Offender could not be updated'
    this.status = status
  }
}
