import Papa from 'papaparse'

export interface PreviewData {
  headers: string[]
  rows: string[][]
  totalRows: number
}

export function parseCSVPreview(content: string, maxRows: number = 100): PreviewData {
  const parsed = Papa.parse<string[]>(content, {
    preview: maxRows,
    skipEmptyLines: true,
  })

  if (!parsed.data || parsed.data.length === 0) {
    return { headers: [], rows: [], totalRows: 0 }
  }

  const headers = parsed.data[0]
  const rows = parsed.data.slice(1)

  return {
    headers,
    rows,
    totalRows: parsed.data.length - 1
  }
}

export function parseJSONPreview(content: string, maxRows: number = 100): PreviewData {
  try {
    const parsed = JSON.parse(content)
    const arr = Array.isArray(parsed) ? parsed : [parsed]
    
    if (arr.length === 0) {
      return { headers: [], rows: [], totalRows: 0 }
    }

    const headerSet = new Set<string>()
    arr.slice(0, maxRows).forEach(obj => {
      if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(k => headerSet.add(k))
      }
    })

    const headers = Array.from(headerSet)
    
    const rows = arr.slice(0, maxRows).map(obj => {
      return headers.map(h => {
        const val = obj[h]
        if (val === null || val === undefined) return ''
        if (typeof val === 'object') return JSON.stringify(val)
        return String(val)
      })
    })

    return {
      headers,
      rows,
      totalRows: arr.length
    }
  } catch (error) {
    console.error('Failed to parse JSON preview', error)
    return { headers: [], rows: [], totalRows: 0 }
  }
}

export type ColumnType = 'number' | 'date' | 'boolean' | 'string'

export function detectColumnTypes(headers: string[], rows: string[][]): ColumnType[] {
  if (rows.length === 0) return headers.map(() => 'string')

  return headers.map((_, colIndex) => {
    let isNumber = true
    let isDate = true
    let isBoolean = true

    for (let rowIndex = 0; rowIndex < Math.min(rows.length, 10); rowIndex++) {
      const val = rows[rowIndex]?.[colIndex]?.trim()
      
      if (!val) continue

      if (isNumber && isNaN(Number(val))) {
        isNumber = false
      }

      if (isBoolean && !['true', 'false', '0', '1', 'yes', 'no'].includes(val.toLowerCase())) {
        isBoolean = false
      }

      if (isDate && isNaN(Date.parse(val))) {
        isDate = false
      }
    }

    if (isBoolean) return 'boolean'
    if (isNumber) return 'number'
    if (isDate) return 'date'
    
    return 'string'
  })
}
