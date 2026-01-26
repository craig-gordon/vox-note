// Default re-export for web platform
// Metro will resolve to .native.ts for mobile
export { useEntryStorage } from './useEntryStorage.web'
export type { UseEntryStorageReturn } from './useEntryStorage.types'
export { STORAGE_PREFIX } from './useEntryStorage.types'
