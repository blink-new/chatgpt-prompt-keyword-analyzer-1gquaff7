import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Upload, Download, FileText, Play, AlertCircle, CheckCircle } from 'lucide-react'
import { BatchRow, BatchAnalysisSession, PromptAnalysis, KeywordMatch } from '@/types'
import { blink } from '@/blink/client'

interface BatchAnalysisProps {
  onBatchComplete: (results: PromptAnalysis[]) => void
}

export function BatchAnalysis({ onBatchComplete }: BatchAnalysisProps) {
  const [batchData, setBatchData] = useState<BatchRow[]>([])
  const [batchSession, setBatchSession] = useState<BatchAnalysisSession | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = () => {
    const template = `prompt,keywords
"Write a creative story about AI","AI,story,creative,technology"
"Explain quantum computing","quantum,computing,physics,science"
"Create a marketing plan","marketing,plan,strategy,business"
"Describe the future of work","future,work,remote,automation"
"Write a poem about nature","poem,nature,environment,beauty"`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'batch-analysis-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const parseCSV = (csvText: string): BatchRow[] => {
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    if (!headers.includes('prompt') || !headers.includes('keywords')) {
      throw new Error('CSV must contain "prompt" and "keywords" columns')
    }

    const promptIndex = headers.indexOf('prompt')
    const keywordsIndex = headers.indexOf('keywords')

    const rows: BatchRow[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Simple CSV parsing - handles quoted fields
      const fields: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          fields.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      fields.push(current.trim())

      if (fields.length >= Math.max(promptIndex + 1, keywordsIndex + 1)) {
        const prompt = fields[promptIndex]?.replace(/"/g, '').trim()
        const keywordsStr = fields[keywordsIndex]?.replace(/"/g, '').trim()
        
        if (prompt && keywordsStr) {
          const keywords = keywordsStr.split(',').map(k => k.trim()).filter(k => k)
          rows.push({ prompt, keywords })
        }
      }
    }

    return rows
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        const rows = parseCSV(csvText)
        
        if (rows.length === 0) {
          throw new Error('No valid rows found in CSV file')
        }
        
        if (rows.length > 50) {
          throw new Error('Maximum 50 rows allowed per batch')
        }

        setBatchData(rows)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse CSV file')
        setBatchData([])
      }
    }
    
    reader.readAsText(file)
  }

  const findKeywordMatches = (text: string, keywords: string[]): KeywordMatch[] => {
    return keywords.map(keyword => {
      const regex = new RegExp(keyword, 'gi')
      const matches = text.match(regex) || []
      const positions: number[] = []
      
      let match
      const searchRegex = new RegExp(keyword, 'gi')
      while ((match = searchRegex.exec(text)) !== null) {
        positions.push(match.index)
      }
      
      return {
        keyword,
        count: matches.length,
        positions
      }
    }).filter(match => match.count > 0)
  }

  const processBatch = async () => {
    if (batchData.length === 0) return

    setIsProcessing(true)
    setError(null)

    const sessionId = `batch-${Date.now()}`
    const startTime = Date.now()

    const session: BatchAnalysisSession = {
      id: sessionId,
      name: `Batch Analysis ${new Date().toLocaleString()}`,
      rows: [...batchData],
      results: [],
      startTime,
      status: 'running',
      totalRows: batchData.length,
      processedRows: 0
    }

    setBatchSession(session)

    try {
      const results: PromptAnalysis[] = []

      for (let i = 0; i < batchData.length; i++) {
        const row = batchData[i]
        
        // Update progress
        setBatchSession(prev => prev ? {
          ...prev,
          processedRows: i
        } : null)

        try {
          console.log(`Processing batch row ${i + 1}/${batchData.length}:`, row.prompt.substring(0, 50) + '...')
          
          // Generate response using Blink AI
          const { text } = await blink.ai.generateText({
            prompt: row.prompt,
            model: 'gpt-4o-mini',
            maxTokens: 500
          })

          // Find keyword matches
          const keywordMatches = findKeywordMatches(text, row.keywords)

          const analysis: PromptAnalysis = {
            id: `batch-analysis-${Date.now()}-${i}`,
            prompt: row.prompt,
            response: text,
            keywordMatches,
            timestamp: Date.now(),
            status: 'completed'
          }

          results.push(analysis)
          
          console.log(`Batch row ${i + 1} completed successfully`)

        } catch (error) {
          console.error(`Error processing batch row ${i + 1}:`, error)
          
          const errorAnalysis: PromptAnalysis = {
            id: `batch-analysis-${Date.now()}-${i}`,
            prompt: row.prompt,
            response: '',
            keywordMatches: [],
            timestamp: Date.now(),
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          }
          
          results.push(errorAnalysis)
        }

        // Small delay between requests to avoid rate limits
        if (i < batchData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      // Complete session
      const endTime = Date.now()
      setBatchSession(prev => prev ? {
        ...prev,
        results,
        endTime,
        status: 'completed',
        processedRows: batchData.length
      } : null)

      // Pass results to parent
      onBatchComplete(results)

      console.log('Batch analysis completed:', {
        totalRows: batchData.length,
        successful: results.filter(r => r.status === 'completed').length,
        errors: results.filter(r => r.status === 'error').length,
        processingTime: `${endTime - startTime}ms`
      })

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Batch processing failed')
      setBatchSession(prev => prev ? { ...prev, status: 'error' } : null)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetBatch = () => {
    setBatchData([])
    setBatchSession(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const exportBatchResults = () => {
    if (!batchSession?.results) return

    const data = {
      session: batchSession,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `batch-analysis-${batchSession.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Batch CSV Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="csv-file">Upload CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="mt-1"
              />
            </div>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Template
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground">
            <p>CSV format: Two columns required - "prompt" and "keywords"</p>
            <p>Keywords should be comma-separated within the cell</p>
            <p>Maximum 50 rows per batch</p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {batchData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Batch Preview ({batchData.length} rows)
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={processBatch}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {isProcessing ? 'Processing...' : 'Start Batch Analysis'}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetBatch}
                  disabled={isProcessing}
                >
                  Reset
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Prompt</TableHead>
                    <TableHead>Keywords</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline">{index + 1}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="truncate" title={row.prompt}>
                          {row.prompt}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {row.keywords.map((keyword, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Section */}
      {batchSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {batchSession.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
                Batch Processing
              </div>
              {batchSession.status === 'completed' && (
                <Button
                  variant="outline"
                  onClick={exportBatchResults}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Results
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{batchSession.processedRows}/{batchSession.totalRows}</span>
              </div>
              <Progress 
                value={(batchSession.processedRows / batchSession.totalRows) * 100} 
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{batchSession.totalRows}</div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {batchSession.results.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {batchSession.results.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {batchSession.endTime 
                    ? `${Math.round((batchSession.endTime - batchSession.startTime) / 1000)}s`
                    : `${Math.round((Date.now() - batchSession.startTime) / 1000)}s`
                  }
                </div>
                <div className="text-sm text-muted-foreground">Time</div>
              </div>
            </div>

            {batchSession.status === 'completed' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Batch analysis completed successfully! Results have been added to your main analysis view.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}