import type { SuperAgentRequest } from 'superagent'
import { faker } from '@faker-js/faker/locale/en_GB'
import { addDays, format } from 'date-fns'
import Offender from '../../server/data/models/offender'
import Checkin from '../../server/data/models/checkin'

import { stubFor } from './wiremock'
import { generateValidCrn, generateValidUKMobileNumber } from '../support/utils'
import OffenderStatus from '../../server/data/models/offenderStatus'
import CheckinInterval from '../../server/data/models/checkinInterval'
import CheckinStatus from '../../server/data/models/checkinStatus'
import AutomatedIdVerificationResult from '../../server/data/models/automatedIdVerificationResult'
import CallbackRequested from '../../server/data/models/survey/callbackRequested'
import MentalHealth from '../../server/data/models/survey/mentalHealth'
import SupportAspect from '../../server/data/models/survey/supportAspect'

// mock generators

const practitionerUsername = 'AUTH_USER'
const offenderStatuses = [OffenderStatus.Initial, OffenderStatus.Verified, OffenderStatus.Inactive]
const checkinIntervals = [
  CheckinInterval.Weekly,
  CheckinInterval.TwoWeeks,
  CheckinInterval.FourWeeks,
  CheckinInterval.EightWeeks,
]
export const createMockOffender = (overrides: Partial<Offender> = {}): Offender => {
  const offenderStatus = overrides.status || faker.helpers.arrayElement(offenderStatuses)
  const uuid = faker.string.uuid()
  const offender = {
    uuid,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    crn: generateValidCrn(),
    dateOfBirth: faker.date.birthdate().toISOString().slice(0, 10),
    status: faker.helpers.arrayElement(offenderStatuses),
    practitioner: practitionerUsername,
    createdAt: new Date().toISOString(),
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

export const createMockCheckin = (offender: Offender, overrides: Partial<Checkin> = {}): Checkin => {
  const status = overrides.status || faker.helpers.arrayElement(Object.values(CheckinStatus))
  const checkin: Checkin = {
    uuid: faker.string.uuid(),
    status,
    dueDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    offender,
    questions: '{}',
    createdBy: practitionerUsername,
    createdAt: faker.date.recent({ days: 3 }).toISOString(),
    submittedAt: null,
    surveyResponse: null,
    reviewedBy: null,
    reviewedAt: null,
    videoUrl: null,
    autoIdCheck: null,
    manualIdCheck: null,
    flaggedResponses: [],
    reviewDueDate: null,
    ...overrides,
  }

  if (checkin.status === CheckinStatus.Submitted || checkin.status === CheckinStatus.Reviewed) {
    checkin.submittedAt = faker.date.recent().toISOString()
    checkin.videoUrl = 'path/to/video.mp4'
    checkin.autoIdCheck = faker.helpers.arrayElement([
      AutomatedIdVerificationResult.Match,
      AutomatedIdVerificationResult.NoMatch,
      null,
    ])
    checkin.surveyResponse = {
      version: '1.0',
      mentalHealth: faker.helpers.arrayElement(Object.values(MentalHealth)),
      assistance: faker.helpers.arrayElements(Object.values(SupportAspect)),
      callback: faker.helpers.arrayElement(Object.values(CallbackRequested)),
      mentalHealthSupport: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      alcoholSupport: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      drugsSupport: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      moneySupport: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      housingSupport: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      supportSystemSupport: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      otherSupport: faker.datatype.boolean() ? faker.lorem.sentence() : null,
      callbackDetails: faker.datatype.boolean() ? faker.lorem.sentence() : null,
    }
  }

  return checkin
}

const createDefaultOffenders = () => [
  createMockOffender({ status: OffenderStatus.Verified }),
  createMockOffender({ status: OffenderStatus.Inactive }),
  createMockOffender({ status: OffenderStatus.Initial }),
]

const createDefaultCheckins = () => [
  createMockCheckin(createMockOffender(), { status: CheckinStatus.Submitted }),
  createMockCheckin(createMockOffender(), {
    status: CheckinStatus.Reviewed,
    reviewedAt: faker.date.recent().toISOString(),
  }),
  createMockCheckin(createMockOffender(), { status: CheckinStatus.Created }),
  createMockCheckin(createMockOffender(), { status: CheckinStatus.Expired }),
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
  // offenders
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
  stubOffenderContactCheck: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/offenders\\?practitioner=.+?&(.+?=.+?)`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          pagination: { pageNumber: 0, pageSize: 20 },
          content: [],
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
  stubUpdateOffender: (offender, httpStatus = 200): SuperAgentRequest => {
    const response = {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody:
        httpStatus < 400
          ? offender
          : {
              userMessage: 'Could not update contact information, email possibly in use',
            },
    }

    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/offenders/${offender.uuid}/details`,
      },
      response,
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
          uuid: faker.string.uuid(),
          practitioner: practitionerUsername,
          offender: faker.string.uuid(),
          createdAt: new Date().toISOString(),
        },
      },
    })
  },

  // checkins
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
  stubGetCheckinsForOffender: ({
    offender,
    checkins,
  }: {
    offender: Offender
    checkins: Checkin[]
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPath: '/offender_checkins',
        queryParameters: {
          practitioner: { matches: '.+' },
          offenderId: { equalTo: offender.uuid },
          page: { matches: '.*' },
          size: { matches: '.*' },
          direction: { matches: '.*' },
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          pagination: { pageNumber: 0, pageSize: checkins.length, totalElements: checkins.length, totalPages: 1 },
          content: checkins,
        },
      },
    })
  },
  stubResendCheckinInvite: (checkin: Checkin): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/offender_checkins/${checkin.uuid}/invite`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: checkin,
      },
    })
  },
  stubGetCheckin: (checkin: Checkin): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/offender_checkins/${checkin.uuid}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          checkin,
          checkinLogs: { logs: [] },
        },
      },
    })
  },
  stubUpdateCheckinSettings: (offender: Offender, httpStatus = 200): SuperAgentRequest => {
    const response = {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: offender,
    }
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/offenders/${offender.uuid}/checkin-settings`,
      },
      response,
    })
  },
  stubStopCheckins: (offender: Offender) => {
    const stoppedOffender = {
      ...offender,
      status: OffenderStatus.Inactive,
      deactivationEntry: {
        comment: faker.lorem.sentence(),
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

  stubGetCheckinUploadLocation: (checkin: Checkin): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/offender_checkins/${checkin.uuid}/upload_location`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          video: { url: 'http://localhost:9091/fake-s3-upload', contentType: 'video/mp4' },
          snapshots: [{ url: 'http://localhost:9091/fake-s3-upload', contentType: 'image/jpeg' }],
          references: [{ url: 'http://localhost:9091/fake-s3-upload', contentType: 'image/jpeg' }],
        },
      },
    })
  },
  stubAutoVerifyCheckinIdentity: (checkin: Checkin, result = AutomatedIdVerificationResult.Match) => {
    const response = { result }
    stubFor({
      request: {
        method: 'POST',
        urlPath: `/offender_checkins/${checkin.uuid}/auto_id_verify`,
        queryParameters: {
          numSnapshots: {
            equalTo: '1',
          },
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: response,
      },
    })
    return response
  },

  stubReviewCheckin: (checkin: Checkin): SuperAgentRequest => {
    const reviewedCheckin = { ...checkin, status: CheckinStatus.Reviewed }
    return stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/offender_checkins/${checkin.uuid}/review`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: reviewedCheckin,
      },
    })
  },
  stubSubmitCheckin: (checkin: Checkin): SuperAgentRequest => {
    const submittedCheckin = { ...checkin, status: CheckinStatus.Submitted }
    return stubFor({
      request: {
        method: 'POST',
        urlPath: `/offender_checkins/${checkin.uuid}/submit`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: submittedCheckin,
      },
    })
  },
}
