# ChatGPT Prompt Analyzer & Keyword Tracker - Recreation Guide

## Project Overview

This is a sophisticated web application that automates the process of analyzing prompts through ChatGPT, saving responses, and tracking specific keyword occurrences. The app provides a beautiful, modern interface with real-time progress tracking, analytics, and batch processing capabilities.

### Key Features
- **Batch Prompt Processing**: Process up to 10 prompts sequentially through ChatGPT API
- **Keyword Tracking**: Configure and track specific keywords in responses with case-insensitive matching
- **Real-time Progress**: Live progress tracking with animated indicators and status updates
- **Beautiful UI**: Modern, responsive design with cards, progress bars, and syntax highlighting
- **Analytics Dashboard**: Comprehensive statistics and insights about keyword frequency and response patterns
- **Batch CSV Upload**: Process multiple prompts with different keywords via CSV upload
- **Export Functionality**: Export results to JSON format for further analysis
- **No Authentication Required**: Works directly with OpenAI API key

## Tech Stack

### Frontend Framework
- **React 19.1.0** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling with custom color palette

### UI Components
- **ShadCN UI** components for consistent, accessible interface
- **Radix UI** primitives for complex components
- **Lucide React** for icons

### API Integration
- **OpenAI API** (`openai` package) for ChatGPT integration
- Direct API calls from frontend (requires API key in environment variables)

### Key Dependencies
```json
{
  "react": "^19.1.0",
  "typescript": "~5.8.3",
  "tailwindcss": "^3.3.5",
  "lucide-react": "^0.525.0",
  "openai": "^5.9.2"
}
```

## Architecture Overview

### Component Structure
```
src/
├── App.tsx                 # Main application component
├── components/
│   ├── PromptInput.tsx     # Prompt input and management
│   ├── KeywordConfig.tsx   # Keyword configuration panel
│   ├── AnalysisProgress.tsx # Real-time progress tracking
│   ├── ResultsGrid.tsx     # Results display with highlighting
│   ├── AnalyticsSummary.tsx # Analytics dashboard
│   ├── BatchAnalysis.tsx   # CSV batch processing
│   └── ui/                 # ShadCN UI components
├── types/
│   └── index.ts           # TypeScript interfaces
├── lib/
│   ├── openai.ts          # OpenAI API integration
│   └── utils.ts           # Utility functions
```

### Data Flow
1. **Setup Phase**: User adds OpenAI API key to environment variables
2. **Input Phase**: User adds prompts (up to 10) and configures keywords to track
3. **Processing Phase**: App processes prompts sequentially through OpenAI API
4. **Analysis Phase**: Responses are analyzed for keyword matches using regex
5. **Display Phase**: Results are displayed with highlighted keywords and analytics

## Core Functionality

### 1. OpenAI Integration (`lib/openai.ts`)
```typescript
import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from backend
})

export async function generateTextWithOpenAI(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7
    })
    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw new Error(`Failed to generate response: ${error.message}`)
  }
}
```

### 2. Prompt Management (`PromptInput.tsx`)
- Add/remove prompts with validation (max 10)
- Real-time character counting and status badges
- Keyboard shortcuts (Ctrl+Enter to add)
- Responsive prompt preview with truncation

### 3. Keyword Configuration (`KeywordConfig.tsx`)
- Dynamic keyword addition/removal
- Case-insensitive duplicate prevention
- Visual keyword badges with remove functionality
- Empty state handling

### 4. AI Processing Engine (`App.tsx`)
```typescript
const processPrompt = async (prompt: string, index: number, analysisId: string): Promise<PromptAnalysis> => {
  try {
    // Update status to processing
    setAnalyses(prev => prev.map(a => 
      a.id === analysisId ? { ...a, status: 'processing' } : a
    ))

    // Generate response using OpenAI
    const text = await generateTextWithOpenAI(prompt)

    // Find keyword matches
    const keywordMatches = findKeywordMatches(text, keywords)

    return {
      id: analysisId,
      prompt,
      response: text,
      keywordMatches,
      timestamp: Date.now(),
      status: 'completed'
    }
  } catch (error) {
    // Handle errors gracefully
    return {
      id: analysisId,
      prompt,
      response: '',
      keywordMatches: [],
      timestamp: Date.now(),
      status: 'error',
      error: error.message
    }
  }
}
```

### 5. Keyword Matching Algorithm
```typescript
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
```

### 6. Real-time Progress Tracking (`AnalysisProgress.tsx`)
- Visual progress bar with percentage completion
- Individual prompt status indicators
- Color-coded status badges (pending, processing, completed, error)
- Live statistics (completed, processing, errors, pending)

### 7. Results Display (`ResultsGrid.tsx`)
- Card-based layout for each prompt/response pair
- Syntax highlighting for keyword matches
- Scrollable content areas for long text
- Status indicators and error handling
- Keyword match badges with counts

### 8. Analytics Dashboard (`AnalyticsSummary.tsx`)
- Total statistics (prompts, responses, matches, processing time)
- Top keywords ranking with frequency analysis
- Progress bars for keyword distribution
- Performance metrics

### 9. Batch Processing (`BatchAnalysis.tsx`)
- CSV file upload and parsing
- Template download functionality
- Bulk processing with progress tracking
- Error handling for individual rows
- Results integration with main analysis

## Data Models

### Core Types (`types/index.ts`)
```typescript
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
```

## Step-by-Step Recreation Guide

### 1. Project Setup
```bash
# Create new Vite React TypeScript project
npm create vite@latest chatgpt-analyzer -- --template react-ts
cd chatgpt-analyzer

# Install core dependencies
npm install openai
npm install lucide-react
npm install tailwindcss tailwindcss-animate
npm install @radix-ui/react-progress @radix-ui/react-tabs
npm install @radix-ui/react-card @radix-ui/react-badge
```

### 2. Configure Tailwind CSS
```javascript
// tailwind.config.cjs
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1",
        accent: "#10B981",
        background: "#FAFAFA",
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}
```

### 3. Setup Environment Variables
Create a `.env.local` file in your project root:
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

**Important**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### 4. Setup OpenAI Integration
```typescript
// src/lib/openai.ts
import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export async function generateTextWithOpenAI(prompt: string): Promise<string> {
  // Implementation as shown above
}
```

### 5. Create Type Definitions
Define all interfaces in `src/types/index.ts` as shown above.

### 6. Build Core Components

#### Main Application (`App.tsx`)
- Remove authentication logic (no login required)
- Add API key validation and error handling
- Implement sequential prompt processing
- Add real-time status updates

#### Input Components
- **PromptInput**: Text area with add/remove functionality
- **KeywordConfig**: Dynamic keyword management with badges

#### Processing Engine
- Sequential prompt processing to avoid rate limits
- Error handling and retry logic
- Real-time status updates

#### Display Components
- **AnalysisProgress**: Progress bars and status indicators
- **ResultsGrid**: Card-based results with keyword highlighting
- **AnalyticsSummary**: Statistics and insights dashboard

### 7. Implement Key Features

#### API Key Management
```typescript
// Check if API key is configured
const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY

// Show warning if not configured
{!hasApiKey && (
  <Alert>
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      <strong>OpenAI API Key Required:</strong> Please add your OpenAI API key to the environment variables as <code>VITE_OPENAI_API_KEY</code>
    </AlertDescription>
  </Alert>
)}
```

#### Error Handling
```typescript
const processPrompt = async (prompt: string): Promise<PromptAnalysis> => {
  try {
    const text = await generateTextWithOpenAI(prompt)
    // Process successful response
  } catch (error) {
    // Check if it's an API key error
    if (error.message.includes('API key')) {
      setApiKeyError(true)
    }
    // Return error analysis
  }
}
```

#### Keyword Highlighting
```typescript
const highlightKeywords = (text: string, keywords: string[]) => {
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
```

#### CSV Batch Processing
```typescript
const parseCSV = (csvText: string): BatchRow[] => {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  
  // Parse CSV with quoted field support
  // Return array of {prompt, keywords} objects
}
```

#### Export Functionality
```typescript
const exportResults = () => {
  const data = {
    session: currentSession,
    analyses,
    analytics,
    exportedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  // Create download link and trigger download
}
```

### 8. Styling & UI Polish
- Implement responsive design with Tailwind CSS
- Add loading states and animations
- Create consistent color scheme and typography
- Add hover effects and transitions

### 9. Error Handling & Validation
- Input validation for prompts and keywords
- API error handling with user-friendly messages
- Rate limiting protection with delays between requests
- Graceful degradation for failed requests

## Advanced Features

### Real-time Updates
- Live progress tracking during processing
- Status indicators for each prompt
- Animated progress bars and spinners

### Analytics Engine
- Keyword frequency analysis
- Response length statistics
- Processing time metrics
- Top keywords ranking

### Batch Processing
- CSV upload with template download
- Bulk processing with individual error handling
- Progress tracking for large batches
- Results integration with main analysis

### Export & Data Management
- JSON export with complete session data
- Analytics export for further analysis
- Session management and history

## Performance Considerations

### Rate Limiting
- Sequential processing to avoid API rate limits
- Configurable delays between requests (1 second default)
- Error handling for rate limit responses

### Memory Management
- Efficient text processing for large responses
- Optimized regex operations for keyword matching
- Proper cleanup of event listeners and timers

### User Experience
- Progressive loading with skeleton states
- Optimistic UI updates
- Responsive design for all screen sizes
- Keyboard shortcuts and accessibility

## Deployment

### Environment Setup
1. **Get OpenAI API Key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Set Environment Variable**: Add `VITE_OPENAI_API_KEY=your_key_here` to `.env.local`
3. **Build and Deploy**: Use any static hosting service (Netlify, Vercel, etc.)

### Security Considerations
- **API Key Exposure**: The current implementation exposes the API key in the browser
- **Production Recommendation**: Move API calls to a backend server for security
- **Rate Limiting**: Implement server-side rate limiting for production use

### Build for Production
```bash
npm run build
```

The built files will be in the `dist` folder, ready for deployment to any static hosting service.

## Testing Strategy

### Unit Testing
- Component rendering and interaction
- Keyword matching algorithm accuracy
- CSV parsing functionality
- Analytics calculations

### Integration Testing
- End-to-end prompt processing flow
- API error handling
- Export functionality
- Batch processing workflow

### User Testing
- Usability testing for complex workflows
- Performance testing with large batches
- Cross-browser compatibility
- Mobile responsiveness

## Future Enhancements

### Security Improvements
- **Backend API**: Move OpenAI calls to secure backend
- **Authentication**: Add user accounts and session management
- **API Key Management**: Secure server-side API key storage

### Potential Features
- **Advanced Analytics**: Sentiment analysis, response categorization
- **Templates**: Pre-built prompt templates for common use cases
- **Scheduling**: Automated batch processing on schedules
- **Integrations**: Export to Google Sheets, Slack notifications
- **Advanced Filtering**: Filter results by keyword density, response length
- **Visualization**: Charts and graphs for keyword trends
- **API Access**: REST API for programmatic access

### Scalability Improvements
- Database integration for persistent storage
- Background job processing for large batches
- Caching for frequently used prompts
- Advanced rate limiting and queue management

## Troubleshooting

### Common Issues

#### API Key Not Working
- Verify the API key is correct and has sufficient credits
- Check that the environment variable name is exactly `VITE_OPENAI_API_KEY`
- Restart the development server after adding the API key

#### Rate Limiting Errors
- The app includes 1-second delays between requests
- For heavy usage, consider increasing the delay
- Monitor your OpenAI usage dashboard for rate limits

#### CSV Upload Issues
- Ensure CSV has "prompt" and "keywords" columns
- Check that keywords are comma-separated within cells
- Verify file encoding is UTF-8

#### Build Issues
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors with `npm run type-check`
- Verify all imports are correct after removing Blink SDK

## Conclusion

This ChatGPT Prompt Analyzer demonstrates a complete transition from a Blink SDK-based application to a standalone React application using direct OpenAI API integration. The application maintains all its core functionality while providing:

- **Direct API Integration**: No dependency on external SDKs
- **Simplified Setup**: Just requires an OpenAI API key
- **Full Feature Set**: All original features preserved
- **Modern Architecture**: Clean React patterns with TypeScript
- **Production Ready**: Can be deployed to any static hosting service

The application serves as an excellent example of:
- Modern React development with hooks and TypeScript
- Direct API integration with error handling
- Real-time UI updates and progress tracking
- Advanced text analysis and keyword matching
- Responsive design and user experience
- Export functionality and data management

This project can be easily extended with additional features and serves as a solid foundation for building similar AI-powered analysis tools.