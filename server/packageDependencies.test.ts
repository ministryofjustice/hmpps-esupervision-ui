import fs from 'fs'
import { globSync } from 'glob'

const packageData = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

describe('app insights compatibility', () => {
  it('uses bunyan v1', () => {
    // See https://github.com/Microsoft/node-diagnostic-channel/blob/master/src/diagnostic-channel-publishers/README.md
    // eslint-disable-next-line no-useless-escape
    expect(packageData.dependencies.bunyan).toMatch(/[^\.]1\..*/)
  })

  it('only forces @opentelemetry/core v2 underneath applicationinsights', () => {
    // applicationinsights v2 declares @opentelemetry/core ^1.19.0, but every published 1.x is
    // vulnerable to GHSA-8988-4f7v-96qf. It requires exactly one function from core at runtime
    // (hrTimeToMilliseconds), so forcing v2 is safe -- but only within its own subtree. Keeping
    // the override scoped stops it leaking into any future consumer of OpenTelemetry.
    expect(packageData.overrides['@opentelemetry/core']).toBeUndefined()
    expect(packageData.overrides.applicationinsights['@opentelemetry/core']).toMatch(/^2\./)
  })
})

describe('brace-expansion override', () => {
  // brace-expansion is pinned to 5.x to clear GHSA-mh99-v99m-4gvg, which has no 1.x/2.x patch.
  // v4 renamed the default export to a named `expand`, so consumers importing it as a default
  // export throw on any `{a,b}` glob. glob v11 -> minimatch v10 imports it the new way, so these
  // assertions fail loudly if the override is ever rolled forward past a compatible pairing.
  it('pins brace-expansion to a patched major', () => {
    expect(packageData.overrides['brace-expansion']).toMatch(/^5\./)
  })

  it('still expands braces through glob and minimatch', () => {
    const matches = globSync('server/utils/*.{ts,js}')

    expect(matches).toContain('server/utils/utils.ts')
    expect(matches).toContain('server/utils/azureAppInsights.ts')
  })

  it("expands the braces in jest's own coverage pattern", () => {
    // "server/**/*.{ts,js,jsx,mjs}" -- if this stops expanding, coverage silently collects nothing
    const matches = globSync(packageData.jest.collectCoverageFrom[0])

    expect(matches).toContain('server/utils/utils.ts')
    expect(matches.length).toBeGreaterThan(10)
  })
})
