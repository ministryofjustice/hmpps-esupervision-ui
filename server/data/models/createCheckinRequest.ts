export default class CreateCheckinRequest {
  practitioner: string // TODO: require uuid?

  offender: string // TODO: require uuid?

  questions: string // TODO: fix structure

  dueDate: string // TODO: require date?
}
