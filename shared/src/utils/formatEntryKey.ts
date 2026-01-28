import { format, parse, setHours, setMinutes, setSeconds } from 'date-fns'

const ENTRY_KEY_FORMAT = 'MM-dd-yy_hh:mm:ssaaa'
const READABLE_FORMAT = 'M-dd-yyyy h:mm:ss aaa'

export function formatEntryKey(date: Date): string {
  return format(date, ENTRY_KEY_FORMAT).toUpperCase()
}

export function formatEntryKeyReadable(entryKey: string): string {
  // Convert AM/PM to lowercase for parsing (date-fns expects lowercase)
  const normalizedKey = entryKey.replace(/(AM|PM)$/i, (match) => match.toLowerCase())
  const date = parse(normalizedKey, ENTRY_KEY_FORMAT, new Date())
  return format(date, READABLE_FORMAT).toUpperCase()
}

export function formatEntryKeyWithDate(customDate: Date): string {
  const now = new Date()
  const dateWithCurrentTime = setSeconds(
    setMinutes(
      setHours(customDate, now.getHours()),
      now.getMinutes()
    ),
    now.getSeconds()
  )
  return format(dateWithCurrentTime, ENTRY_KEY_FORMAT).toUpperCase()
}
