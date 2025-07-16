import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, AlertCircle, Hash, Clock } from 'lucide-react'
import { PromptAnalysis } from '@/types'

interface ResultsGridProps {
  analyses: PromptAnalysis[]
}

export function ResultsGrid({ analyses }: ResultsGridProps) {
  const highlightKeywords = (text: string, keywords: string[]) => {
    if (!keywords.length) return text
    
    let highlightedText = text
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi')
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>'
      )
    })
    
    return highlightedText
  }

  const getStatusIcon = (status: PromptAnalysis['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: PromptAnalysis['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 dark:bg-green-950'
      case 'error':
        return 'text-red-600 bg-red-50 dark:bg-red-950'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950'
    }
  }

  if (analyses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Hash className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Results Yet</h3>
          <p className="text-muted-foreground text-center">
            Add prompts and keywords, then start the analysis to see results here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {analyses.map((analysis, index) => (
        <Card key={analysis.id} className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Prompt {index + 1}</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(analysis.status)}
                <Badge 
                  variant="outline" 
                  className={getStatusColor(analysis.status)}
                >
                  {analysis.status}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 space-y-4">
            {/* Prompt */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Prompt:</h4>
              <ScrollArea className="h-20">
                <p className="text-sm leading-relaxed">{analysis.prompt}</p>
              </ScrollArea>
            </div>

            <Separator />

            {/* Response */}
            {analysis.status === 'completed' && analysis.response && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Response:</h4>
                <ScrollArea className="h-32">
                  <div 
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: highlightKeywords(
                        analysis.response,
                        analysis.keywordMatches.map(m => m.keyword)
                      )
                    }}
                  />
                </ScrollArea>
              </div>
            )}

            {analysis.status === 'error' && analysis.error && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-red-600">Error:</h4>
                <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">
                  {analysis.error}
                </p>
              </div>
            )}

            {analysis.status === 'processing' && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {analysis.status === 'pending' && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8" />
              </div>
            )}

            {/* Keyword Matches */}
            {analysis.status === 'completed' && analysis.keywordMatches.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                    Keyword Matches ({analysis.keywordMatches.reduce((sum, match) => sum + match.count, 0)}):
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.keywordMatches.map((match) => (
                      <Badge key={match.keyword} variant="secondary" className="text-xs">
                        {match.keyword} ({match.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {analysis.status === 'completed' && analysis.keywordMatches.length === 0 && (
              <>
                <Separator />
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">No keyword matches found</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}