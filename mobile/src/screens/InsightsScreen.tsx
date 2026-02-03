import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useJournal } from '../context/JournalContext'
import type { InsightItem } from '@journaling-app/shared'

function InsightCard({ insight }: { insight: InsightItem }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons
          name={insight.icon as keyof typeof Ionicons.glyphMap}
          size={24}
          color={getColorForType(insight.type)}
        />
        <Text style={styles.cardTitle}>{insight.title}</Text>
      </View>
      <Text style={styles.cardDescription}>{insight.description}</Text>
    </View>
  )
}

function getColorForType(type: InsightItem['type']): string {
  switch (type) {
    case 'mood':
      return '#FF6B6B'
    case 'energy':
      return '#FFB84D'
    case 'productivity':
      return '#4CAF50'
    case 'pattern':
      return '#5C6BC0'
    case 'suggestion':
      return '#26A69A'
    default:
      return '#666'
  }
}

export function InsightsScreen() {
  const { insights, insightsLoading, insightsRefreshing, insightsError, refreshInsights } = useJournal()

  // Loading state (only shown when no cached insights)
  if (insightsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Analyzing your journal entries...</Text>
      </View>
    )
  }

  // Error state
  if (insightsError && !insights) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
        <Text style={styles.errorText}>{insightsError}</Text>
        <Pressable style={styles.retryButton} onPress={refreshInsights}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    )
  }

  // Empty state (no entries in past week)
  if (insights && insights.analyzedEntryCount === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="journal-outline" size={60} color="#ccc" />
        <Text style={styles.emptyTitle}>No Recent Entries</Text>
        <Text style={styles.emptySubtitle}>
          Record some journal entries to see insights about your week.
        </Text>
      </View>
    )
  }

  // No insights generated yet
  if (!insights || insights.insights.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="bulb-outline" size={60} color="#ccc" />
        <Text style={styles.emptyTitle}>No Insights Yet</Text>
        <Text style={styles.emptySubtitle}>
          Keep journaling to discover patterns in your week.
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Insights</Text>
        <View style={styles.headerRight}>
          {insightsRefreshing && (
            <Text style={styles.updatingText}>Updating...</Text>
          )}
          <Pressable onPress={refreshInsights} style={styles.refreshButton}>
            <Ionicons name="refresh-outline" size={22} color="#007AFF" />
          </Pressable>
        </View>
      </View>

      <Text style={styles.subheader}>
        Based on {insights.analyzedEntryCount} {insights.analyzedEntryCount === 1 ? 'entry' : 'entries'} from the past week
      </Text>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {insights.insights.map((insight, index) => (
          <InsightCard key={index} insight={insight} />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updatingText: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  refreshButton: {
    padding: 8,
  },
  subheader: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
})
