import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, X } from 'lucide-react'

interface PromptInputProps {
  prompts: string[]
  onPromptsChange: (prompts: string[]) => void
}

export function PromptInput({ prompts, onPromptsChange }: PromptInputProps) {
  const [currentPrompt, setCurrentPrompt] = useState('')

  const addPrompt = () => {
    if (currentPrompt.trim() && prompts.length < 10) {
      onPromptsChange([...prompts, currentPrompt.trim()])
      setCurrentPrompt('')
    }
  }

  const removePrompt = (index: number) => {
    onPromptsChange(prompts.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      addPrompt()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Prompts ({prompts.length}/10)
          <Badge variant={prompts.length === 10 ? 'default' : 'secondary'}>
            {prompts.length === 10 ? 'Ready' : 'Add More'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Enter your prompt here... (Ctrl+Enter to add)"
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[100px] resize-none"
          />
          <Button 
            onClick={addPrompt}
            disabled={!currentPrompt.trim() || prompts.length >= 10}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Prompt
          </Button>
        </div>

        {prompts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Added Prompts:</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {prompts.map((prompt, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg"
                >
                  <Badge variant="outline" className="mt-0.5 shrink-0">
                    {index + 1}
                  </Badge>
                  <p className="text-sm flex-1 leading-relaxed">{prompt}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePrompt(index)}
                    className="shrink-0 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}