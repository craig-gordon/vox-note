import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { RecordScreen } from '../screens/RecordScreen'
import { CalendarScreen } from '../screens/CalendarScreen'
import { InsightsScreen } from '../screens/InsightsScreen'
import { useJournal } from '../context/JournalContext'

type TabName = 'Record' | 'Journal' | 'Insights'

const tabs: { name: TabName; component: React.ComponentType }[] = [
  { name: 'Record', component: RecordScreen },
  { name: 'Journal', component: CalendarScreen },
  { name: 'Insights', component: InsightsScreen },
]

export function TabNavigator() {
  const [activeTab, setActiveTab] = useState<TabName>('Record')
  const { isRecording, isTranscribing } = useJournal()

  const isRecordingInProgress = isRecording || isTranscribing

  const ActiveScreen = tabs.find(t => t.name === activeTab)?.component || RecordScreen

  const handleTabPress = (name: TabName) => {
    if (isRecordingInProgress && name !== 'Record') return
    setActiveTab(name)
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name
          const isDisabled = isRecordingInProgress && tab.name !== 'Record'

          return (
            <Pressable
              key={tab.name}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => handleTabPress(tab.name)}
              disabled={isDisabled}
            >
              <Text style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
                isDisabled && styles.tabLabelDisabled,
              ]}>
                {tab.name}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <View style={styles.screenContainer}>
        <ActiveScreen />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  tabLabelActive: {
    color: '#007AFF',
  },
  tabLabelDisabled: {
    color: '#ccc',
  },
  screenContainer: {
    flex: 1,
  },
})
