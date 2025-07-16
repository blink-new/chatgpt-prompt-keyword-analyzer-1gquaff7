import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Play, Download, RotateCcw, Brain, BarChart } from 'lucide-react'
import { blink } from '@/blink/client'
import { PromptInput } from '@/components/PromptInput'
import { KeywordConfig } from '@/components/KeywordConfig'
import { AnalysisProgress } from '@/components/AnalysisProgress'
import { ResultsGrid } from '@/components/ResultsGrid'
import { AnalyticsSummary } from '@/components/AnalyticsSummary'
import { BatchAnalysis } from '@/components/BatchAnalysis'
import { PromptAnalysis, AnalysisSession, AnalyticsData, KeywordMatch } from '@/types'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [prompts, setPrompts] = useState<string[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [analyses, setAnalyses] = useState<PromptAnalysis[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentSession, setCurrentSession] = useState<AnalysisSession | null>(null)

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  // Calculate analytics
  const analytics: AnalyticsData = {
    totalPrompts: analyses.length,
    totalResponses: analyses.filter(a => a.status === 'completed').length,
    totalKeywordMatches: analyses.reduce((sum, a) => 
      sum + a.keywordMatches.reduce((matchSum, match) => matchSum + match.count, 0), 0
    ),
    averageResponseLength: analyses.length > 0 
      ? Math.round(analyses.reduce((sum, a) => sum + (a.response?.length || 0), 0) / analyses.length)
      : 0,
    keywordFrequency: analyses.reduce((freq, analysis) => {
      analysis.keywordMatches.forEach(match => {
        freq[match.keyword] = (freq[match.keyword] || 0) + match.count
      })
      return freq
    }, {} as Record<string, number>),
    processingTime: currentSession 
      ? (currentSession.endTime || Date.now()) - currentSession.startTime 
      : 0
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

  const processPrompt = async (prompt: string, index: number, analysisId: string): Promise<PromptAnalysis> => {
    try {
      console.log(`Processing prompt ${index + 1}/${prompts.length}:`, prompt.substring(0, 50) + '...')
      
      // Update status to processing
      setAnalyses(prev => prev.map(a => 
        a.id === analysisId ? { ...a, status: 'processing' } : a
      ))

      // Generate response using Blink AI
      const { text } = await blink.ai.generateText({
        prompt: prompt,
        model: 'gpt-4o-mini',
        maxTokens: 500
      })

      console.log(`Prompt ${index + 1} completed successfully. Response length:`, text.length)

      // Find keyword matches
      const keywordMatches = findKeywordMatches(text, keywords)

      const completedAnalysis: PromptAnalysis = {
        id: analysisId,
        prompt,
        response: text,
        keywordMatches,
        timestamp: Date.now(),
        status: 'completed'
      }

      return completedAnalysis
    } catch (error) {
      console.error(`Error processing prompt ${index + 1}:`, error)
      
      const errorAnalysis: PromptAnalysis = {
        id: analysisId,
        prompt,
        response: '',
        keywordMatches: [],
        timestamp: Date.now(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
      return errorAnalysis
    }
  }

  const startAnalysis = async () => {
    if (prompts.length === 0 || keywords.length === 0) return

    console.log('Starting analysis with:', { promptCount: prompts.length, keywords })
    
    setIsRunning(true)
    const sessionId = `session-${Date.now()}`
    const startTime = Date.now()

    // Create session
    const session: AnalysisSession = {
      id: sessionId,
      prompts: [...prompts],
      keywords: [...keywords],
      results: [],
      startTime,
      status: 'running'
    }
    setCurrentSession(session)

    // Initialize analyses
    const initialAnalyses: PromptAnalysis[] = prompts.map((prompt, index) => ({
      id: `analysis-${Date.now()}-${index}`,
      prompt,
      response: '',
      keywordMatches: [],
      timestamp: Date.now(),
      status: 'pending'
    }))
    setAnalyses(initialAnalyses)
    
    console.log('Initialized analyses:', initialAnalyses.map(a => ({ id: a.id, status: a.status })))

    // Process prompts sequentially to avoid rate limits
    const results: PromptAnalysis[] = []
    for (let i = 0; i < prompts.length; i++) {
      const analysisId = initialAnalyses[i].id
      const result = await processPrompt(prompts[i], i, analysisId)
      results.push(result)
      
      // Update analyses with the completed result
      setAnalyses(prev => prev.map(a => 
        a.id === result.id ? result : a
      ))

      // Small delay between requests
      if (i < prompts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Complete session
    const endTime = Date.now()
    const processingTime = endTime - startTime
    
    console.log('Analysis completed:', { 
      totalResults: results.length, 
      successful: results.filter(r => r.status === 'completed').length,
      errors: results.filter(r => r.status === 'error').length,
      processingTime: `${processingTime}ms`
    })
    
    setCurrentSession(prev => prev ? {
      ...prev,
      results,
      endTime,
      status: 'completed'
    } : null)

    setIsRunning(false)
  }

  const resetAnalysis = () => {
    setAnalyses([])
    setCurrentSession(null)
    setIsRunning(false)
  }

  const exportResults = () => {
    const data = {
      session: currentSession,
      analyses,
      analytics,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chatgpt-analysis-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleBatchComplete = (batchResults: PromptAnalysis[]) => {
    // Add batch results to main analyses
    setAnalyses(prev => [...prev, ...batchResults])
    
    // Create a session for the batch
    const batchSession: AnalysisSession = {
      id: `batch-session-${Date.now()}`,
      prompts: batchResults.map(r => r.prompt),
      keywords: [], // Keywords are per-prompt in batch mode
      results: batchResults,
      startTime: Math.min(...batchResults.map(r => r.timestamp)),
      endTime: Math.max(...batchResults.map(r => r.timestamp)),
      status: 'completed'
    }
    
    setCurrentSession(batchSession)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>ChatGPT Prompt Analyzer</CardTitle>
            <p className="text-muted-foreground">
              Please sign in to start analyzing prompts
            </p>
          </CardHeader>
          <CardContent>
            <Button onClick={() => blink.auth.login()} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canStart = prompts.length > 0 && keywords.length > 0 && !isRunning

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ChatGPT Prompt Analyzer</h1>
              <p className="text-muted-foreground">
                Analyze prompts and track keyword occurrences
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Welcome, {user.email}</Badge>
            <Button variant="outline" onClick={() => blink.auth.logout()}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Control Panel */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Analysis Control
              <div className="flex gap-2">
                <Button
                  onClick={startAnalysis}
                  disabled={!canStart}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Analysis
                </Button>
                <Button
                  variant="outline"
                  onClick={resetAnalysis}
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
                {analyses.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={exportResults}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              <PromptInput prompts={prompts} onPromptsChange={setPrompts} />
              <KeywordConfig keywords={keywords} onKeywordsChange={setKeywords} />
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        {analyses.length > 0 && (
          <div className="mb-6">
            <AnalysisProgress analyses={analyses} isRunning={isRunning} />
          </div>
        )}

        {/* Results */}
        <Tabs defaultValue="manual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual Analysis</TabsTrigger>
            <TabsTrigger value="batch">Batch Analysis</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
            <ResultsGrid analyses={analyses.filter(a => !a.id.startsWith('batch-analysis-'))} />
          </TabsContent>

          <TabsContent value="batch" className="space-y-6">
            <BatchAnalysis onBatchComplete={handleBatchComplete} />
            {analyses.filter(a => a.id.startsWith('batch-analysis-')).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Batch Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResultsGrid analyses={analyses.filter(a => a.id.startsWith('batch-analysis-'))} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {analyses.length > 0 ? (
              <AnalyticsSummary analytics={analytics} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Analytics Yet</h3>
                  <p className="text-muted-foreground text-center">
                    Run an analysis to see detailed statistics and insights.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App