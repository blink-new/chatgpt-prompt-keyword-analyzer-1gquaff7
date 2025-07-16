export interface PromptAnalysis {
  id: string
  prompt: string
  response: string
  keywordMatches: KeywordMatch[]
  timestamp: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
}

export interface KeywordMatch {
  keyword: string
  count: number
  positions: number[]
}

export interface AnalysisSession {
  id: string
  prompts: string[]
  keywords: string[]
  results: PromptAnalysis[]
  startTime: number
  endTime?: number
  status: 'idle' | 'running' | 'completed' | 'error'
}

export interface AnalyticsData {
  totalPrompts: number
  totalResponses: number
  totalKeywordMatches: number
  averageResponseLength: number
  keywordFrequency: Record<string, number>
  processingTime: number
}

export interface BatchRow {
  prompt: string
  keywords: string[]
}

export interface BatchAnalysisSession {
  id: string
  name: string
  rows: BatchRow[]
  results: PromptAnalysis[]
  startTime: number
  endTime?: number
  status: 'idle' | 'running' | 'completed' | 'error'
  totalRows: number
  processedRows: number
}