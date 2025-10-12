/**
 * Suppress annoying console errors from browser extensions
 * This should be called once when the app initializes
 */
export function suppressBrowserExtensionErrors() {
  if (typeof window === 'undefined') return

  const originalError = console.error
  const originalWarn = console.warn

  // Suppress specific console errors
  console.error = function (...args: any[]) {
    const errorMsg = args[0]?.toString?.() || ''
    
    // List of error messages to suppress
    const suppressPatterns = [
      'Could not establish connection',
      'Receiving end does not exist',
      'Extension context invalidated',
      'runtime.lastError',
    ]
    
    // Check if error should be suppressed
    const shouldSuppress = suppressPatterns.some(pattern => 
      errorMsg.includes(pattern)
    )
    
    if (shouldSuppress) {
      return // Ignore
    }
    
    originalError.apply(console, args)
  }

  // Suppress specific console warnings
  console.warn = function (...args: any[]) {
    const warnMsg = args[0]?.toString?.() || ''
    
    // List of warning messages to suppress
    const suppressPatterns = [
      'Extension context invalidated',
    ]
    
    // Check if warning should be suppressed
    const shouldSuppress = suppressPatterns.some(pattern => 
      warnMsg.includes(pattern)
    )
    
    if (shouldSuppress) {
      return // Ignore
    }
    
    originalWarn.apply(console, args)
  }
}
