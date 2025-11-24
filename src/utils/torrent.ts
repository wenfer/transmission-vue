export const getTrackerHost = (announce: string): string => {
  try {
    const url = new URL(announce)
    return url.host || announce
  } catch {
    return announce
  }
}
