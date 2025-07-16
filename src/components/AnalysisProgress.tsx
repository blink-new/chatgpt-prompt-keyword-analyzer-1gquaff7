import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { PromptAnalysis } from '@/types'

interface AnalysisProgressProps {
  analyses: PromptAnalysis[]
  isRunning: boolean
}

export function AnalysisProgress({ analyses, isRunning }: AnalysisProgressProps) {
  const completed = analyses.filter(a => a.status === 'completed').length
  const processing = analyses.filter(a => a.status === 'processing').length
  const errors = analyses.filter(a => a.status === 'error').length
  const pending = analyses.filter(a => a.status === 'pending').length
  
  const progress = analyses.length > 0 ? (completed / analyses.length) * 100 : 0

  const getStatusIcon = (status: PromptAnalysis['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: PromptAnalysis['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'processing':
        return 'bg-blue-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Analysis Progress
          {isRunning && (
            <Badge variant="secondary" className="animate-pulse">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Running
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{completed}/{analyses.length} completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{processing}</div>
            <div className="text-xs text-muted-foreground">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{errors}</div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
        </div>

        {analyses.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Individual Progress:</h4>
            <div className="space-y-1">
              {analyses.map((analysis, index) => (
                <div
                  key={analysis.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getStatusIcon(analysis.status)}
                    <span className="text-sm font-medium">Prompt {index + 1}</span>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(analysis.status)}`} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {analysis.status === 'completed' && analysis.keywordMatches.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {analysis.keywordMatches.reduce((sum, match) => sum + match.count, 0)} matches
                      </Badge>
                    )}
                    {analysis.status === 'error' && (
                      <Badge variant="destructive" className="text-xs">
                        Error
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}