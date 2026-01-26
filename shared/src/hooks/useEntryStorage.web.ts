import { useState, useEffect, useCallback } from 'react'
import { formatEntryKey } from '../utils/formatEntryKey'
import type { UseEntryStorageReturn } from './useEntryStorage.types'
import { STORAGE_PREFIX } from './useEntryStorage.types'

function loadAllEntryKeys(): string[] {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(STORAGE_PREFIX)) {
      keys.push(key.replace(STORAGE_PREFIX, ''))
    }
  }
  return keys.sort().reverse()
}

export function useEntryStorage(): UseEntryStorageReturn {
  const [entryKeys, setEntryKeys] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setEntryKeys(loadAllEntryKeys())
    setIsLoading(false)
  }, [])

  const saveEntry = useCallback(async (content: string): Promise<string> => {
    const key = formatEntryKey(new Date())
    localStorage.setItem(STORAGE_PREFIX + key, content)
    setEntryKeys(loadAllEntryKeys())
    return key
  }, [])

  const loadEntry = useCallback(async (key: string): Promise<string | null> => {
    return localStorage.getItem(STORAGE_PREFIX + key)
  }, [])

  const deleteEntry = useCallback(async (key: string): Promise<void> => {
    localStorage.removeItem(STORAGE_PREFIX + key)
    setEntryKeys(loadAllEntryKeys())
  }, [])

  const deleteAllEntries = useCallback(async (): Promise<void> => {
    const keysToDelete: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach((key) => localStorage.removeItem(key))
    setEntryKeys([])
  }, [])

  return {
    entryKeys,
    isLoading,
    saveEntry,
    loadEntry,
    deleteEntry,
    deleteAllEntries,
  }
}
