import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart, TrendingUp, Hash, Clock } from 'lucide-react'
import { AnalyticsData } from '@/types'

interface AnalyticsSummaryProps {
  analytics: AnalyticsData
}

export function AnalyticsSummary({ analytics }: AnalyticsSummaryProps) {
  const topKeywords = Object.entries(analytics.keywordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalPrompts}</div>
          <p className="text-xs text-muted-foreground">
            {analytics.totalResponses} completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Keyword Matches</CardTitle>
          <Hash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{analytics.totalKeywordMatches}</div>
          <p className="text-xs text-muted-foreground">
            Across all responses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Response Length</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.averageResponseLength}</div>
          <p className="text-xs text-muted-foreground">
            Characters per response
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(analytics.processingTime)}</div>
          <p className="text-xs text-muted-foreground">
            Total analysis time
          </p>
        </CardContent>
      </Card>

      {/* Top Keywords */}
      {topKeywords.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Top Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topKeywords.map(([keyword, count], index) => {
                const percentage = analytics.totalKeywordMatches > 0 
                  ? (count / analytics.totalKeywordMatches) * 100 
                  : 0
                
                return (
                  <div key={keyword} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="font-medium">{keyword}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {count} matches
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}