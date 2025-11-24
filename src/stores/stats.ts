import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'

interface DailySnapshot {
  date: string
  uploaded: number
  downloaded: number
}

interface TrackerSnapshot {
  date: string
  tracker: string
  uploaded: number
  downloaded: number
}

const STORAGE_KEY = 'transmission-stats-history'
const TRACKER_STORAGE_KEY = 'transmission-tracker-history'

const loadHistory = (): DailySnapshot[] => {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as DailySnapshot[]
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => typeof item.date === 'string')
        .map((item) => ({
          date: item.date,
          uploaded: Number(item.uploaded) || 0,
          downloaded: Number(item.downloaded) || 0,
        }))
    }
    return []
  } catch {
    return []
  }
}

const loadTrackerHistory = (): TrackerSnapshot[] => {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(TRACKER_STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as TrackerSnapshot[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => typeof item.date === 'string' && typeof item.tracker === 'string')
      .map((item) => ({
        date: item.date,
        tracker: item.tracker,
        uploaded: Number(item.uploaded) || 0,
        downloaded: Number(item.downloaded) || 0,
      }))
  } catch {
    return []
  }
}

export const useStatsStore = defineStore('stats', () => {
  const history = ref<DailySnapshot[]>(loadHistory())
  const trackerHistory = ref<TrackerSnapshot[]>(loadTrackerHistory())

  const sortedHistory = computed(() =>
    [...history.value].sort((a, b) => a.date.localeCompare(b.date))
  )

  const dailyStats = computed(() => {
    return sortedHistory.value.map((snapshot, index) => {
      const previous = sortedHistory.value[index - 1]
      const uploadedDelta = Math.max(
        0,
        snapshot.uploaded - (previous ? previous.uploaded : 0)
      )
      const downloadedDelta = Math.max(
        0,
        snapshot.downloaded - (previous ? previous.downloaded : 0)
      )
      return {
        date: snapshot.date,
        uploaded: uploadedDelta,
        downloaded: downloadedDelta,
      }
    })
  })

  const sortedTrackerHistory = computed(() =>
    [...trackerHistory.value].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.tracker.localeCompare(b.tracker)
    })
  )

  const trackerDailyStats = computed(() => {
    const result: TrackerSnapshot[] = []
    const lastByTracker = new Map<string, { uploaded: number; downloaded: number }>()
    sortedTrackerHistory.value.forEach((snapshot) => {
      const previous = lastByTracker.get(snapshot.tracker)
      const uploadedDelta = Math.max(
        0,
        snapshot.uploaded - (previous ? previous.uploaded : 0)
      )
      const downloadedDelta = Math.max(
        0,
        snapshot.downloaded - (previous ? previous.downloaded : 0)
      )
      result.push({
        date: snapshot.date,
        tracker: snapshot.tracker,
        uploaded: uploadedDelta,
        downloaded: downloadedDelta,
      })
      lastByTracker.set(snapshot.tracker, {
        uploaded: snapshot.uploaded,
        downloaded: snapshot.downloaded,
      })
    })
    return result
  })

  const latestSnapshot = computed(() => {
    const list = sortedHistory.value
    return list.length ? list[list.length - 1] : null
  })

  const recordSnapshot = (uploaded: number, downloaded: number, date?: string) => {
    const targetDate = date || dayjs().format('YYYY-MM-DD')
    const existing = history.value.find((item) => item.date === targetDate)
    if (existing) {
      existing.uploaded = uploaded
      existing.downloaded = downloaded
    } else {
      history.value.push({
        date: targetDate,
        uploaded,
        downloaded,
      })
    }
  }

  const recordTrackerSnapshot = (
    trackers: Record<string, { uploaded: number; downloaded: number }>,
    date?: string
  ) => {
    const targetDate = date || dayjs().format('YYYY-MM-DD')
    Object.entries(trackers).forEach(([tracker, value]) => {
      const existing = trackerHistory.value.find(
        (item) => item.date === targetDate && item.tracker === tracker
      )
      if (existing) {
        existing.uploaded = value.uploaded
        existing.downloaded = value.downloaded
      } else {
        trackerHistory.value.push({
          date: targetDate,
          tracker,
          uploaded: value.uploaded,
          downloaded: value.downloaded,
        })
      }
    })
  }

  const clearHistory = () => {
    history.value = []
    trackerHistory.value = []
  }

  watch(
    history,
    (value) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      }
    },
    { deep: true }
  )

  watch(
    trackerHistory,
    (value) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(value))
      }
    },
    { deep: true }
  )

  return {
    history,
    trackerHistory,
    dailyStats,
    trackerDailyStats,
    latestSnapshot,
    recordSnapshot,
    recordTrackerSnapshot,
    clearHistory,
  }
})
