// Detect if running in Electron environment
export const isElectron = () => {
  if (typeof window === 'undefined') return false
  return !!(window as any)?.isElectron
}

// Get Electron API if available
export const getElectronAPI = () => {
  if (typeof window === 'undefined') return null
  return (window as any)?.electronAPI
}

// Platform detection for Electron
export const getPlatform = () => {
  if (typeof window === 'undefined') return 'server'
  return (window as any)?.electronAPI?.platform || 'web'
}

// Check if a feature is supported
export const isFeatureSupported = (feature: string) => {
  const api = getElectronAPI()
  if (!api) return false

  switch (feature) {
    case 'chat':
      return typeof api.chat === 'function'
    case 'notes':
      return typeof api.getNotes === 'function'
    case 'reword':
      return typeof api.reword === 'function'
    case 'tasks':
      return typeof api.getTasks === 'function'
    case 'files':
      return typeof api.showSaveDialog === 'function'
    default:
      return false
  }
}
