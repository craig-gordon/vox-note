import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { formatEntryKey } from '../utils/formatEntryKey'
import type { UseEntryStorageReturn } from './useEntryStorage.types'
import { STORAGE_PREFIX } from './useEntryStorage.types'

async function loadAllEntryKeys(): Promise<string[]> {
  const allKeys = await AsyncStorage.getAllKeys()
  const journalKeys = allKeys
    .filter((key) => key.startsWith(STORAGE_PREFIX))
    .map((key) => key.replace(STORAGE_PREFIX, ''))
  return journalKeys.sort().reverse()
}

export function useEntryStorage(): UseEntryStorageReturn {
  const [entryKeys, setEntryKeys] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAllEntryKeys().then((keys) => {
      setEntryKeys(keys)
      setIsLoading(false)
    })
  }, [])

  const saveEntry = useCallback(async (content: string): Promise<string> => {
    const key = formatEntryKey(new Date())
    await AsyncStorage.setItem(STORAGE_PREFIX + key, content)
    const keys = await loadAllEntryKeys()
    setEntryKeys(keys)
    return key
  }, [])

  const loadEntry = useCallback(async (key: string): Promise<string | null> => {
    return AsyncStorage.getItem(STORAGE_PREFIX + key)
  }, [])

  const deleteEntry = useCallback(async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(STORAGE_PREFIX + key)
    const keys = await loadAllEntryKeys()
    setEntryKeys(keys)
  }, [])

  const deleteAllEntries = useCallback(async (): Promise<void> => {
    const allKeys = await AsyncStorage.getAllKeys()
    const journalKeys = allKeys.filter((key) => key.startsWith(STORAGE_PREFIX))
    await AsyncStorage.multiRemove(journalKeys)
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
