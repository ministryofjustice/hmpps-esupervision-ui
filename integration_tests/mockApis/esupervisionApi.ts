import type { SuperAgentRequest } from 'superagent'
import { faker } from '@faker-js/faker'

import { stubFor } from './wiremock'
import generateValidCrn from '../support/utils'

const practitionerUsername = 'AUTH_USER'
const offenderStatuses = ['INITIAL', 'VERIFIED', 'INACTIVE']
const checkinIntervals = ['WEEKLY', 'TWO_WEEKS', 'FOUR_WEEKS', 'EIGHT_WEEKS']
const checkinStatuses = ['CREATED', 'SUBMITTED', 'REVIEWED', 'EXPIRED']

export const createMockOffender = (overrides = {}) => {
  return {
    uuid: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    crn: generateValidCrn(),
    dateOfBirth: faker.date.birthdate().toISOString().slice(0, 10),
    status: faker.helpers.arrayElement(offenderStatuses),
    practitioner: practitionerUsername,
    createdAt: faker.date.recent({ days: 10 }).toISOString(),
    email: faker.internet.email(),
    phoneNumber: faker.phone.number(),
    photoUrl: null,
    firstCheckin: faker.date.soon({ days: 7 }).toISOString().slice(0, 10),
    checkinInterval: faker.helpers.arrayElement(checkinIntervals),
    ...overrides,
  }
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
  createMockOffender({ status: 'VERIFIED' }),
  createMockOffender({ status: 'INACTIVE' }),
  createMockOffender({ status: 'INITIAL' }),
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

  stubCreateOffender: (httpStatus = 200): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/offender_setup`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          setupUuid: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          practitionerId: 'string',
          firstName: 'string',
          lastName: 'string',
          crn: 'strings',
          dateOfBirth: '2025-10-02',
          email: 'string',
          phoneNumber: 'string',
          firstCheckinDate: '2025-10-02',
          checkinInterval: 'WEEKLY',
        },
      },
    })
  },
  stubGetProfilePhotoUploadLocation: (httpStatus = 200): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/offender_setup/.+?/upload_location\\?content-type=.+?`,
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
        urlPattern: `/fake-s3-upload`,
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
