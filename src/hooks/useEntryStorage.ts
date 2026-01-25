import { useState, useEffect, useCallback } from 'react'
import { formatEntryKey } from '../utils/formatEntryKey'

const STORAGE_PREFIX = 'journal_'

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

export function useEntryStorage() {
  const [entryKeys, setEntryKeys] = useState<string[]>([])

  useEffect(() => {
    setEntryKeys(loadAllEntryKeys())
  }, [])

  const saveEntry = useCallback((content: string): string => {
    const key = formatEntryKey(new Date())
    localStorage.setItem(STORAGE_PREFIX + key, content)
    setEntryKeys(loadAllEntryKeys())
    return key
  }, [])

  const loadEntry = useCallback((key: string): string | null => {
    return localStorage.getItem(STORAGE_PREFIX + key)
  }, [])

  const deleteEntry = useCallback((key: string): void => {
    localStorage.removeItem(STORAGE_PREFIX + key)
    setEntryKeys(loadAllEntryKeys())
  }, [])

  const deleteAllEntries = useCallback((): void => {
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
    saveEntry,
    loadEntry,
    deleteEntry,
    deleteAllEntries,
  }
}
