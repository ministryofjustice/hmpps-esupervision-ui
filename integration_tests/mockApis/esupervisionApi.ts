import type { SuperAgentRequest } from 'superagent'

import { stubFor } from './wiremock'

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
  stubOffenders: (httpStatus = 200): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/offenders\\?practitioner=.+?`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          pagination: { pageNumber: 0, pageSize: 20 },
          content: [
            {
              uuid: 'ac73d948-4785-4531-aa2d-662ccebcaa0f',
              firstName: 'Frodo',
              lastName: 'Baggins',
              crn: 'A123456',
              dateOfBirth: '1970-01-01',
              status: 'INACTIVE',
              practitioner: 'AUTH_USER',
              createdAt: '2025-09-23T14:10:33.371215Z',
              email: null,
              phoneNumber: null,
              photoUrl: null,
              firstCheckin: null,
              checkinInterval: 'WEEKLY',
            },
          ],
        },
      },
    })
  },
  stubOffenderCheckins: (httpStatus = 200): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/offender_checkins\\?practitioner=.+?`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          pagination: { pageNumber: 0, pageSize: 20 },
          content: [
            {
              uuid: 'e1c8f6a0-f264-45eb-b6ab-021ce2df9ef3',
              status: 'CANCELLED',
              dueDate: '2025-09-30',
              offender: {
                uuid: 'ac73d948-4785-4531-aa2d-662ccebcaa0f',
                firstName: 'Frodo',
                lastName: 'Baggins',
                crn: 'A123456',
                dateOfBirth: '1970-01-01',
                status: 'INACTIVE',
                practitioner: 'AUTH_USER',
                createdAt: '2025-09-23T14:10:33.371215Z',
                email: null,
                phoneNumber: null,
                photoUrl: null,
                firstCheckin: null,
                checkinInterval: 'WEEKLY',
              },
              submittedAt: null,
              surveyResponse: null,
              createdBy: 'AUTH_USER',
              createdAt: '2025-09-30T15:15:00.092480Z',
              reviewedBy: null,
              reviewedAt: null,
              videoUrl: null,
              snapshotUrl: null,
              autoIdCheck: null,
              manualIdCheck: null,
              flaggedResponses: [],
            },
          ],
        },
      },
    })
  },
}
