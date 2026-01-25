const suppressedPatterns = [
  'powerPreference',
  'VerifyEachNodeIsAssignedToAnEp',
  'Some nodes were not assigned',
]

const shouldSuppress = (msg: unknown) =>
  typeof msg === 'string' && suppressedPatterns.some((p) => msg.includes(p))

/**
 * Suppresses known warnings/errors from third-party libraries.
 * Returns a restore function to call when suppression is no longer needed.
 */
export function suppressKnownWarnings(): () => void {
  const originalWarn = console.warn
  const originalError = console.error

  console.warn = (...args: unknown[]) => {
    if (shouldSuppress(args[0])) return
    originalWarn.apply(console, args)
  }

  console.error = (...args: unknown[]) => {
    if (shouldSuppress(args[0])) return
    originalError.apply(console, args)
  }

  return () => {
    console.warn = originalWarn
    console.error = originalError
  }
}
