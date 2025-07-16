import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Hash } from 'lucide-react'

interface KeywordConfigProps {
  keywords: string[]
  onKeywordsChange: (keywords: string[]) => void
}

export function KeywordConfig({ keywords, onKeywordsChange }: KeywordConfigProps) {
  const [currentKeyword, setCurrentKeyword] = useState('')

  const addKeyword = () => {
    const keyword = currentKeyword.trim().toLowerCase()
    if (keyword && !keywords.includes(keyword)) {
      onKeywordsChange([...keywords, keyword])
      setCurrentKeyword('')
    }
  }

  const removeKeyword = (keywordToRemove: string) => {
    onKeywordsChange(keywords.filter(k => k !== keywordToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-5 h-5" />
          Keywords to Track ({keywords.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter keyword to track..."
            value={currentKeyword}
            onChange={(e) => setCurrentKeyword(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={addKeyword}
            disabled={!currentKeyword.trim() || keywords.includes(currentKeyword.trim().toLowerCase())}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {keywords.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Tracking Keywords:</h4>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {keyword}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeKeyword(keyword)}
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {keywords.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Add keywords to track in ChatGPT responses</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}