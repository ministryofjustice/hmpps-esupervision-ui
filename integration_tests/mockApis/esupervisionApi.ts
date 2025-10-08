import type { SuperAgentRequest } from 'superagent'
import { faker } from '@faker-js/faker/locale/en_GB'
import Offender from '../../server/data/models/offender'
import { stubFor } from './wiremock'
import { generateValidCrn, generateValidUKMobileNumber } from '../support/utils'
import OffenderStatus from '../../server/data/models/offenderStatus'
import CheckinInterval from '../../server/data/models/checkinInterval'
import CheckinStatus from '../../server/data/models/checkinStatus'

const practitionerUsername = 'AUTH_USER'
const offenderStatuses = [OffenderStatus.Initial, OffenderStatus.Verified, OffenderStatus.Inactive]
const checkinIntervals = [
  CheckinInterval.Weekly,
  CheckinInterval.TwoWeeks,
  CheckinInterval.FourWeeks,
  CheckinInterval.EightWeeks,
]
const checkinStatuses = [CheckinStatus.Created, CheckinStatus.Submitted, CheckinStatus.Reviewed, CheckinStatus.Expired]

export const createMockOffender = (overrides: Partial<Offender> = {}): Offender => {
  const offenderStatus = overrides.status || faker.helpers.arrayElement(offenderStatuses)
  const offender = {
    uuid: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    crn: generateValidCrn(),
    dateOfBirth: faker.date.birthdate().toISOString().slice(0, 10),
    status: faker.helpers.arrayElement(offenderStatuses),
    practitioner: practitionerUsername,
    createdAt: faker.date.recent({ days: 10 }).toISOString(),
    email: faker.internet.email(),
    phoneNumber: generateValidUKMobileNumber(),
    photoUrl: faker.image.personPortrait(),
    firstCheckin: faker.date.soon({ days: 7 }).toISOString().slice(0, 10),
    checkinInterval: faker.helpers.arrayElement(checkinIntervals),
    deactivationEntry:
      offenderStatus === OffenderStatus.Inactive
        ? {
            uuid: faker.string.uuid(),
            comment: faker.lorem.sentence(),
            createdAt: faker.date.recent().toISOString(),
          }
        : null,
    ...overrides,
  }
  return offender
}

const createMockCheckin = (offender, overrides = {}) => {
  return {
    uuid: faker.string.uuid(),
    status: faker.helpers.arrayElement(checkinStatuses),
    dueDate: faker.date.future({ years: 1 }).toISOString().slice(0, 10),
    offender,
    submittedAt: null,
    surveyResponse: null,
    createdBy: practitionerUsername,
    createdAt: faker.date.recent({ days: 3 }).toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    videoUrl: null,
    snapshotUrl: null,
    autoIdCheck: null,
    manualIdCheck: null,
    flaggedResponses: [],
    ...overrides,
  }
}

const createDefaultOffenders = () => [
  createMockOffender({ status: OffenderStatus.Verified }),
  createMockOffender({ status: OffenderStatus.Inactive }),
  createMockOffender({ status: OffenderStatus.Initial }),
]

const createDefaultCheckins = () => [
  createMockCheckin(createMockOffender(), { status: 'SUBMITTED' }),
  createMockCheckin(createMockOffender(), { status: 'REVIEWED', reviewedAt: faker.date.recent().toISOString() }),
  createMockCheckin(createMockOffender(), { status: 'CREATED' }),
  createMockCheckin(createMockOffender(), { status: 'EXPIRED' }),
]

// Stubs

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    })
  },
  stubOffenders: (offenders = createDefaultOffenders()): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/offenders\\?practitioner=.+?`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          pagination: { pageNumber: 0, pageSize: 20 },
          content: offenders,
        },
      },
    })
  },
  stubGetOffender: (offender): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/offenders/${offender.uuid}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: offender,
      },
    })
  },
  stubOffenderCheckins: (checkins = createDefaultCheckins()): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/offender_checkins\\?practitioner=.+?`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          pagination: { pageNumber: 0, pageSize: 20 },
          content: checkins,
        },
      },
    })
  },

  stubStopCheckins: offender => {
    const stoppedOffender = {
      ...offender,
      status: 'INACTIVE',
      deactivationEntry: {
        comment: 'Case has been transferred.',
        deactivatedBy: practitionerUsername,
        deactivationDate: new Date().toISOString(),
      },
    }

    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/offenders/${offender.uuid}/deactivate`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: stoppedOffender,
      },
    })
  },
  stubCreateOffender: (offenderData = createMockOffender()) => {
    const response = {
      uuid: offenderData.uuid,
      practitioner: practitionerUsername,
      createdAt: new Date().toISOString(),
    }
    return stubFor({
      request: {
        method: 'POST',
        urlPath: `/offender_setup`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: response,
      },
    })
  },
  stubGetProfilePhotoUploadLocation: (httpStatus = 200): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/offender_setup/.+?/upload_location`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          locationInfo: {
            url: 'http://localhost:9091/fake-s3-upload',
            method: 'PUT',
          },
        },
      },
    })
  },
  stubFakeS3Upload: (httpStatus = 200): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPath: `/fake-s3-upload`,
      },
      response: {
        status: httpStatus,
      },
    })
  },
  stubCompleteOffenderSetup: (httpStatus = 200): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/offender_setup/.+?/complete`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          uuid: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          practitioner: 'string',
          offender: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          createdAt: '2025-10-02T11:14:45.948Z',
        },
      },
    })
  },
}
