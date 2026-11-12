import fs from 'fs'
import { globSync } from 'glob'

const packageData = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

const installedVersion = (name: string): string =>
  JSON.parse(fs.readFileSync(`./node_modules/${name}/package.json`, 'utf-8')).version

/** Returns a negative number when `version` is older than `minimum`. */
const compareVersions = (version: string, minimum: string): number => {
  const parts = version.split('.').map(Number)
  const diff = minimum
    .split('.')
    .map((part, i) => (parts[i] ?? 0) - Number(part))
    .find(d => d !== 0)
  return diff ?? 0
}

describe('telemetry compatibility', () => {
  it('uses bunyan v1', () => {
    // @opentelemetry/instrumentation-bunyan, used by @ministryofjustice/hmpps-azure-telemetry, supports bunyan v1
    // eslint-disable-next-line no-useless-escape
    expect(packageData.dependencies.bunyan).toMatch(/[^\.]1\..*/)
  })

  it('resolves a patched @opentelemetry/core', () => {
    // Parts of the @ministryofjustice/hmpps-azure-telemetry tree (e.g. @azure/monitor-opentelemetry-exporter)
    // pin @opentelemetry/core versions vulnerable to GHSA-8988-4f7v-96qf, so package.json overrides it to a
    // patched v2 within that subtree only.
    expect(compareVersions(installedVersion('@opentelemetry/core'), '2.8.0')).toBeGreaterThanOrEqual(0)
  })
})

describe('brace-expansion override', () => {
  // brace-expansion is overridden to 5.x to clear GHSA-mh99-v99m-4gvg, which has no 1.x/2.x
  // patch. v4 renamed the default export to a named `expand`, so the transitively bundled
  // minimatch@3 and minimatch@9 now throw on any `{a,b}` glob. These tests cover the brace
  // globs we actually rely on.
  it('resolves a patched brace-expansion', () => {
    expect(compareVersions(installedVersion('brace-expansion'), '5.0.8')).toBeGreaterThanOrEqual(0)
  })

  it('still expands braces through glob and minimatch', () => {
    // glob v11 -> minimatch v10 imports brace-expansion the new way, so this keeps working.
    // It is the same path the esbuild build uses to clear dist/assets/{css,js}.
    const matches = globSync('server/utils/*.{ts,js}')

    expect(matches).toContain('server/utils/utils.ts')
    expect(matches).toContain('server/utils/telemetry.ts')
  })

  it('does not configure a coverageThreshold glob containing braces', () => {
    // jest matches collectCoverageFrom with micromatch, which is unaffected by the override, but
    // it resolves coverageThreshold keys with glob@7 -> minimatch@3, which throws
    // "expand is not a function" on a brace pattern. Brace-free keys short-circuit safely.
    const thresholdGlobs = Object.keys(packageData.jest.coverageThreshold ?? {})

    expect(thresholdGlobs.filter(pattern => pattern.includes('{'))).toEqual([])
  })
})
