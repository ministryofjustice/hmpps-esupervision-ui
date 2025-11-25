import { LabeledSiteCount } from '../data/models/stats'

type DeviceTypeRow = {
  locations: Map<string, LabeledSiteCount>
  percentage: number
  total: number
}

/**
 * Transforms device type statistics into a structured map for the dashboard.
 */
const formatDeviceTypeStats = (deviceStats: LabeledSiteCount[]): Map<string, DeviceTypeRow> => {
  const KNOWN_DEVICE_TYPES = ['Smartphone', 'Tablet', 'Desktop/Laptop', 'Unknown']
  const deviceTypesMap = new Map<string, DeviceTypeRow>()

  KNOWN_DEVICE_TYPES.forEach(type => {
    deviceTypesMap.set(type, {
      locations: new Map(),
      percentage: 0,
      total: 0,
    })
  })

  deviceStats.forEach(item => {
    const label = item.label === 'UNKNOWN' ? 'Unknown' : item.label
    let found = deviceTypesMap.get(label)
    // if it's not in the known devices map, add a new row
    if (!found) {
      found = {
        locations: new Map(),
        percentage: 0,
        total: 0,
      }
      deviceTypesMap.set(label, found)
    }
    found.locations.set(item.location, item)
    if (item.total) found.total = item.total
    if (item.percentage) found.percentage = item.percentage
  })

  return deviceTypesMap
}

export default formatDeviceTypeStats
