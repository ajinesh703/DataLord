export const ALLOWED_FILE_TYPES = [
  { extension: '.csv', mime: 'text/csv' },
  { extension: '.json', mime: 'application/json' },
  { extension: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { extension: '.zip', mime: 'application/zip' }
]

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 50MB limit' }
  }

  const isValidType = ALLOWED_FILE_TYPES.some(type => 
    file.type === type.mime || file.name.toLowerCase().endsWith(type.extension)
  )

  if (!isValidType) {
    return { valid: false, error: 'Invalid file type. Only CSV, JSON, XLSX, and ZIP are allowed.' }
  }

  return { valid: true }
}

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.')
  if (lastDot === -1) return ''
  return fileName.substring(lastDot).toLowerCase()
}

export function generateStoragePath(userId: string, fileName: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const extension = getFileExtension(fileName)
  const baseName = fileName.replace(extension, '').replace(/[^a-zA-Z0-9-]/g, '_')
  
  return `${userId}/${timestamp}-${baseName}-${randomStr}${extension}`
}
