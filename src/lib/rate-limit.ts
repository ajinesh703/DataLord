class RateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>()

  rateLimit(key: string, limit: number, windowMs: number): { success: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const record = this.store.get(key)

    if (!record || record.resetAt < now) {
      this.store.set(key, { count: 1, resetAt: now + windowMs })
      return { success: true, remaining: limit - 1, resetAt: now + windowMs }
    }

    if (record.count >= limit) {
      return { success: false, remaining: 0, resetAt: record.resetAt }
    }

    record.count += 1
    return { success: true, remaining: limit - record.count, resetAt: record.resetAt }
  }
}

export const uploadLimiter = new RateLimiter()
export const downloadLimiter = new RateLimiter()
export const commentLimiter = new RateLimiter()

export function checkUploadRateLimit(ip: string) {
  return uploadLimiter.rateLimit(`upload_${ip}`, 5, 60 * 60 * 1000)
}

export function checkDownloadRateLimit(ip: string) {
  return downloadLimiter.rateLimit(`download_${ip}`, 50, 60 * 60 * 1000)
}

export function checkCommentRateLimit(ip: string) {
  return commentLimiter.rateLimit(`comment_${ip}`, 20, 60 * 60 * 1000)
}
