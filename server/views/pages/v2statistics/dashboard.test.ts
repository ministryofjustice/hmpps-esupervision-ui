import express from 'express'
import nunjucksSetup from '../../../utils/nunjucksSetup'
import { V2FeedbackStats } from '../../../data/models/v2stats'

const HELPS_FEEL_SUPPORTED = 'Do online check ins help the person feel supported by probation'
const LESS_CONTACT_NEEDED =
  'Does using online check ins mean the person needs to get in touch with their probation officer less'
const GETTING_SUPPORT = 'Does the person on probation believe they are getting the support they need from probation'

const emptyFeedbackStats: V2FeedbackStats = {
  feedbackTotal: 0,
  howEasyCounts: {},
  howEasyPct: {},
  gettingSupportCounts: {},
  gettingSupportPct: {},
  helpsFeelSupportedCounts: {},
  helpsFeelSupportedPct: {},
  lessContactNeededCounts: {},
  lessContactNeededPct: {},
  improvementsCounts: {},
  improvementsPct: {},
}

const app = express()
nunjucksSetup(app)

const render = (context: object): Promise<string> =>
  new Promise((resolve, reject) => {
    app.render('pages/v2statistics/dashboard', context, (err, html) => (err ? reject(err) : resolve(html)))
  })

const tableRows = (html: string, caption: string): string[][] => {
  const table = (html.match(/<table[\s\S]*?<\/table>/g) ?? []).find((t: string) => t.includes(caption))
  if (!table) throw new Error(`Table not found: ${caption}`)
  const body = table.match(/<tbody[\s\S]*?<\/tbody>/)[0]
  return (body.match(/<tr[\s\S]*?<\/tr>/g) ?? []).map((row: string) =>
    (row.match(/<t[hd][\s\S]*?<\/t[hd]>/g) ?? []).map((cell: string) => cell.replace(/<[^>]+>/g, '').trim()),
  )
}

describe('v2statistics dashboard view', () => {
  it('displays the new feedback questions independently of getting support', async () => {
    const html = await render({
      feedbackStats: {
        ...emptyFeedbackStats,
        gettingSupportCounts: { yes: 9, no: 8, notAnswered: 7 },
        gettingSupportPct: { yes: 0.1, no: 0.2 },
        helpsFeelSupportedCounts: { yes: 3, no: 1, notAnswered: 2 },
        helpsFeelSupportedPct: { yes: 0.75, no: 0.25 },
        lessContactNeededCounts: { yes: 1, no: 2, notAnswered: 4 },
        lessContactNeededPct: { yes: 0.3333, no: 0.6667 },
      },
    })

    expect(tableRows(html, HELPS_FEEL_SUPPORTED)).toEqual([
      ['Yes', '3', '75.00%'],
      ['No', '1', '25.00%'],
      ['Not answered', '2', ''],
    ])
    expect(tableRows(html, LESS_CONTACT_NEEDED)).toEqual([
      ['Yes', '1', '33.33%'],
      ['No', '2', '66.67%'],
      ['Not answered', '4', ''],
    ])
    expect(tableRows(html, GETTING_SUPPORT)).toEqual([
      ['Yes', '9', '10.00%'],
      ['No', '8', '20.00%'],
      ['Not answered', '7', ''],
    ])
  })

  it('displays zeros for the new questions when their maps are empty', async () => {
    const html = await render({ feedbackStats: emptyFeedbackStats })

    const expected = [
      ['Yes', '0', '0.00%'],
      ['No', '0', '0.00%'],
      ['Not answered', '0', ''],
    ]
    expect(tableRows(html, HELPS_FEEL_SUPPORTED)).toEqual(expected)
    expect(tableRows(html, LESS_CONTACT_NEEDED)).toEqual(expected)
  })

  it('displays zeros for the new questions when their maps are missing', async () => {
    const html = await render({
      feedbackStats: {
        ...emptyFeedbackStats,
        helpsFeelSupportedCounts: undefined,
        helpsFeelSupportedPct: undefined,
        lessContactNeededCounts: undefined,
        lessContactNeededPct: undefined,
      },
    })

    expect(tableRows(html, HELPS_FEEL_SUPPORTED)[0]).toEqual(['Yes', '0', '0.00%'])
    expect(tableRows(html, LESS_CONTACT_NEEDED)[0]).toEqual(['Yes', '0', '0.00%'])
  })

  describe('dashboard layout', () => {
    const stats = {
      completedCheckins: 1843,
      notCompletedOnTime: 342,
      signedUp: 1001,
      activeUsers: 780,
      inactiveUsers: 34,
    }
    const textOf = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

    it('puts the filters in a details reveal with date and region filters', async () => {
      const html = await render({
        stats,
        feedbackStats: emptyFeedbackStats,
        regionOptions: [{ value: '', text: 'All regions', selected: true }],
      })

      expect(html).toContain('govuk-details')
      expect(textOf(html)).toContain('Filter data')
      expect(textOf(html)).toContain('Filter date')
      expect(html).toContain('name="region"')
      expect(textOf(html)).toContain('All regions')
    })

    it('shows the key data at a glance cards', async () => {
      const html = await render({ stats, feedbackStats: emptyFeedbackStats })

      expect(html).toMatch(/<h2[^>]*>Key data at a glance<\/h2>/)
      const cards = (html.match(/<li class="app-stat-card">[\s\S]*?<\/li>/g) ?? []).map(card => textOf(card).trim())
      expect(cards).toEqual([
        '1843 check ins completed',
        '342 check ins missed',
        '1001 people signed up to the service',
        '780 people actively using the service',
        '34 people who have stopped using the service',
      ])
    })

    it('shows eight theme tabs, each telling screen reader users where they are', async () => {
      const html = await render({ stats, feedbackStats: emptyFeedbackStats })

      expect(html).toMatch(/<h2[^>]*>View data by theme<\/h2>/)
      const tabs = (html.match(/<a class="govuk-tabs__tab"[^>]*>[\s\S]*?<\/a>/g) ?? []).map(tab => textOf(tab).trim())
      expect(tabs).toEqual([
        'How the service is used',
        'Managing risk',
        'Scheduling',
        'Links',
        'Additional questions',
        'Device use',
        'Time',
        'Feedback',
      ])
      expect(html).toContain('<span class="govuk-visually-hidden">, tab 1 of 8</span>')
      expect(html).toContain('<span class="govuk-visually-hidden">, tab 8 of 8</span>')
    })

    it('replaces the feedback tables with a message when a region is selected', async () => {
      const html = await render({ stats, feedbackStats: emptyFeedbackStats, feedbackAvailable: false })

      expect(textOf(html)).toContain('Feedback is not yet available by region')
      expect(html).not.toContain(HELPS_FEEL_SUPPORTED)
    })
  })
})
