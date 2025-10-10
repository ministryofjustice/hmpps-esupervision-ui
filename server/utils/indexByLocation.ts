export type WithLocation = { location: string }

export function indexByLocation<T extends WithLocation, V>(
  rows: T[],
  mapper: (row: T) => V,
  reducer?: (acc: V, val: V) => V,
): Record<string, V> {
  const out: Record<string, V> = {}
  for (const row of rows) {
    const key = row.location
    const next = mapper(row)

    if (key in out && reducer) {
      out[key] = reducer(out[key], next)
    } else {
      out[key] = next
    }
  }
  return out
}
