import { useCallback, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, RefreshControl } from 'react-native'
import { Calendar } from 'react-native-calendars'
import type { DateData } from 'react-native-calendars'
import { formatEntryKeyReadable, formatDateForDisplay } from '@journaling-app/shared'
import { useJournal } from '../context/JournalContext'

export function CalendarScreen() {
  const {
    entryKeys,
    selectedDate,
    setSelectedDate,
    markedDates,
    entriesForSelectedDate,
    selectedEntry,
    setSelectedEntry,
    handleSelectEntry,
    deleteAllEntries,
    refreshEntries,
    isRefreshing,
    loadEntry,
  } = useJournal()

  const handleDayPress = useCallback((day: DateData) => {
    setSelectedEntry(null)
    setSelectedDate(day.dateString)
  }, [setSelectedDate, setSelectedEntry])

  const handleCloseEntry = () => {
    setSelectedEntry(null)
  }

  const handleClearAllEntries = async () => {
    await deleteAllEntries()
    setSelectedEntry(null)
    setSelectedDate(null)
  }

  // Auto-load entry when selecting a date with single entry
  useEffect(() => {
    const autoLoadSingleEntry = async () => {
      if (entriesForSelectedDate.length === 1 && !selectedEntry) {
        const key = entriesForSelectedDate[0]
        const content = await loadEntry(key)
        if (content) {
          setSelectedEntry({ key, content })
        }
      }
    }
    autoLoadSingleEntry()
  }, [entriesForSelectedDate, selectedEntry, loadEntry, setSelectedEntry])

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refreshEntries}
          colors={['#007AFF']}
          tintColor="#007AFF"
        />
      }
    >
      <View style={styles.entriesHeader}>
        <Text style={styles.entriesSectionTitle}>Journal Calendar</Text>
        {entryKeys.length > 0 ? (
          <Pressable onPress={handleClearAllEntries}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </Pressable>
        ) : null}
      </View>

      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          backgroundColor: 'transparent',
          calendarBackground: 'white',
          textSectionTitleColor: '#666',
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#007AFF',
          dayTextColor: '#333',
          textDisabledColor: '#d9e1e8',
          dotColor: '#007AFF',
          selectedDotColor: '#ffffff',
          arrowColor: '#007AFF',
          monthTextColor: '#333',
          textDayFontWeight: '400',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '600',
        }}
        style={styles.calendar}
      />

      {selectedDate && entriesForSelectedDate.length > 1 ? (
        <View style={styles.entriesListContainer}>
          <Text style={styles.dateLabel}>
            {formatDateForDisplay(selectedDate)} ({entriesForSelectedDate.length} entries)
          </Text>
          <View style={styles.entriesList}>
            {entriesForSelectedDate.map((key) => (
              <Pressable
                key={key}
                style={[
                  styles.entryItem,
                  selectedEntry?.key === key && styles.entryItemSelected,
                ]}
                onPress={() => handleSelectEntry(key)}
              >
                <Text style={styles.entryItemText}>{formatEntryKeyReadable(key)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {selectedDate && entriesForSelectedDate.length === 0 ? (
        <View style={styles.noEntriesContainer}>
          <Text style={styles.noEntriesText}>
            No entries for {formatDateForDisplay(selectedDate)}
          </Text>
        </View>
      ) : null}

      {selectedEntry ? (
        <View style={styles.selectedEntryContainer}>
          <View style={styles.selectedEntryHeader}>
            <Text style={styles.selectedEntryLabel}>{formatEntryKeyReadable(selectedEntry.key)}</Text>
            <Pressable onPress={handleCloseEntry}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
          <Text style={styles.selectedEntryText}>{selectedEntry.content}</Text>
        </View>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingTop: 50,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entriesSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearAllText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  calendar: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  entriesListContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  entriesList: {
    gap: 8,
  },
  entryItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  entryItemText: {
    fontSize: 16,
    color: '#007AFF',
  },
  entryItemSelected: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  noEntriesContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  noEntriesText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedEntryContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedEntryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  closeText: {
    fontSize: 14,
    color: '#007AFF',
  },
  selectedEntryText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
})
