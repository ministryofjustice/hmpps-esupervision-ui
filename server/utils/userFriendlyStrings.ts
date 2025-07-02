const definitions: Record<string, string> = {
  YES: 'Yes',
  NO: 'No',
  EMAIL: 'Email',
  TEXT: 'Text message',
  BOTH: 'Both',
  WEEKLY: 'Every week',
  TWO_WEEKS: 'Every 2 weeks',
  FOUR_WEEKS: 'Every 4 weeks',
}

export default function getUserFriendlyString(key: string): string {
  if (!key) {
    return ''
  }
  return definitions[key.trim().toUpperCase()] ?? key
}
