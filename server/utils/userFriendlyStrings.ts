const definitions: Record<string, string> = {
  YES: 'Yes',
  NO: 'No',
  EMAIL: 'Email',
  TEXT: 'Text message',
  BOTH: 'Both',
  WEEKLY: 'Every week',
  TWO_WEEKS: 'Every 2 weeks',
  FOUR_WEEKS: 'Every 4 weeks',
  VERY_WELL: 'Very well',
  WELL: 'Well',
  NOT_GREAT: 'Not great',
  STRUGGLING: 'Struggling',
  MENTAL_HEALTH: 'Mental health',
  ALCOHOL: 'Alcohol',
  DRUGS: 'Drugs',
  MONEY: 'Money',
  SUPPORT_SYSTEM: 'Support system',
  OTHER: 'Other',
  NO_HELP: 'No, I do not need help',
}

export default function getUserFriendlyString(key: string): string {
  if (!key) {
    return ''
  }
  return definitions[key.trim().toUpperCase()] ?? key
}
