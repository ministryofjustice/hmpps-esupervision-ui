import { YearMonth } from '../../data/models/v2stats'

type SelectItem = {
  value: string
  text: string
  selected?: boolean
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const firstOfMonth = (y: number, mIndex0: number) => new Date(y, mIndex0, 1)

const addMonths = (d: Date, n: number) => firstOfMonth(d.getFullYear(), d.getMonth() + n)

export const toMonthValue = (d: Date): YearMonth => {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  return `${y}-${String(m).padStart(2, '0')}` as YearMonth
}

export const buildMonthOptions = (selectedValue: string): SelectItem[] => {
  const start = firstOfMonth(2025, 7) // Aug 2025
  const end = firstOfMonth(new Date().getFullYear(), new Date().getMonth())

  const items: SelectItem[] = []

  for (let selectDate = start; selectDate <= end; selectDate = addMonths(selectDate, 1)) {
    const value = toMonthValue(selectDate)

    items.push({
      value,
      text: `${MONTHS[selectDate.getMonth()]} ${selectDate.getFullYear()}`,
      selected: value === selectedValue,
    })
  }

  return items
}
