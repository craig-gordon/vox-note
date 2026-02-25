import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { useJournal } from '../context/JournalContext'
import type { InsightItem } from '@journaling-app/shared'

function getColorForType(type: InsightItem['type']): string {
  switch (type) {
    case 'pattern':
      return '#5C6BC0'
    case 'connection':
      return '#FF9800'
    case 'question':
      return '#26A69A'
    case 'suggestion':
      return '#4CAF50'
    default:
      return '#666'
  }
}

function InsightCard({ insight }: { insight: InsightItem }) {
  return (
    <View style={[styles.card, { borderLeftColor: getColorForType(insight.type), borderLeftWidth: 4 }]}>
      <Text style={styles.cardTitle}>{insight.title}</Text>
      <Text style={styles.cardDescription}>{insight.description}</Text>
    </View>
  )
}

function FeedbackButton({ label, isSelected, onPress }: { label: string; isSelected: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={[styles.feedbackButton, isSelected && styles.feedbackButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.feedbackButtonText, isSelected && styles.feedbackButtonTextSelected]}>
        {label}
      </Text>
    </Pressable>
  )
}

export function InsightsScreen() {
  const {
    insight,
    insightsLoading,
    insightsGenerating,
    insightsError,
    generateNewInsight,
    submitInsightFeedback,
  } = useJournal()

  // Loading state (fetching from DB)
  if (insightsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading insights...</Text>
      </View>
    )
  }

  // Error state
  if (insightsError && !insight) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{insightsError}</Text>
        <Pressable style={styles.retryButton} onPress={generateNewInsight}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    )
  }

  // No insights yet - prompt to generate
  if (!insight) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Insights Yet</Text>
        <Text style={styles.emptySubtitle}>
          Generate AI-powered insights from your journal entries.
        </Text>
        <Pressable style={styles.generateButton} onPress={generateNewInsight}>
          <Text style={styles.generateButtonText}>Generate Insights</Text>
        </Pressable>
      </View>
    )
  }

  // Empty result (no entries in past month)
  if (insight.result.analyzedEntryCount === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Recent Entries</Text>
        <Text style={styles.emptySubtitle}>
          Record a journal entry to start generating insights.
        </Text>
      </View>
    )
  }

  const insights = insight.result.insights

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monthly Insights</Text>
        <View style={styles.headerRight}>
          {insightsGenerating ? (
            <Text style={styles.updatingText}>Generating...</Text>
          ) : null}
          <Pressable onPress={generateNewInsight} disabled={insightsGenerating}>
            <Text style={[styles.refreshText, insightsGenerating && styles.refreshTextDisabled]}>
              Refresh
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.subheader}>
        Based on {insight.result.analyzedEntryCount} {insight.result.analyzedEntryCount === 1 ? 'entry' : 'entries'} from the past month
      </Text>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {insights.map((item, index) => (
          <InsightCard key={index} insight={item} />
        ))}

        {/* Feedback Section */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackLabel}>Was this helpful?</Text>
          <View style={styles.feedbackButtons}>
            <FeedbackButton
              label="Helpful"
              isSelected={insight.feedback === 'positive'}
              onPress={() => submitInsightFeedback('positive')}
            />
            <FeedbackButton
              label="OK"
              isSelected={insight.feedback === 'neutral'}
              onPress={() => submitInsightFeedback('neutral')}
            />
            <FeedbackButton
              label="Not helpful"
              isSelected={insight.feedback === 'negative'}
              onPress={() => submitInsightFeedback('negative')}
            />
          </View>
        </View>
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
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: '#fff',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updatingText: {
    fontSize: 12,
    color: '#999',
  },
  refreshText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  refreshTextDisabled: {
    color: '#ccc',
  },
  subheader: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  generateButton: {
    marginTop: 24,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  feedbackLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  feedbackButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  feedbackButtonText: {
    fontSize: 14,
    color: '#666',
  },
  feedbackButtonTextSelected: {
    color: '#fff',
  },
})
