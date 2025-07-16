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
- **Authentication**: Secure user authentication with Blink SDK

## Tech Stack

### Frontend Framework
- **React 19.1.0** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling with custom color palette

### UI Components
- **ShadCN UI** components for consistent, accessible interface
- **Radix UI** primitives for complex components
- **Lucide React** for icons
- **Framer Motion** for animations

### Backend & Services
- **Blink SDK** (`@blinkdotnew/sdk`) for:
  - User authentication
  - AI text generation (ChatGPT integration)
  - Database operations
  - File storage

### Key Dependencies
```json
{
  "@blinkdotnew/sdk": "^0.17.3",
  "react": "^19.1.0",
  "typescript": "~5.8.3",
  "tailwindcss": "^3.3.5",
  "lucide-react": "^0.525.0"
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
├── blink/
│   └── client.ts          # Blink SDK configuration
└── lib/
    └── utils.ts           # Utility functions
```

### Data Flow
1. **Input Phase**: User adds prompts (up to 10) and configures keywords to track
2. **Processing Phase**: App processes prompts sequentially through Blink AI (ChatGPT)
3. **Analysis Phase**: Responses are analyzed for keyword matches using regex
4. **Display Phase**: Results are displayed with highlighted keywords and analytics

## Core Functionality

### 1. Prompt Management (`PromptInput.tsx`)
- Add/remove prompts with validation (max 10)
- Real-time character counting and status badges
- Keyboard shortcuts (Ctrl+Enter to add)
- Responsive prompt preview with truncation

### 2. Keyword Configuration (`KeywordConfig.tsx`)
- Dynamic keyword addition/removal
- Case-insensitive duplicate prevention
- Visual keyword badges with remove functionality
- Empty state handling

### 3. AI Processing Engine (`App.tsx`)
```typescript
const processPrompt = async (prompt: string, index: number, analysisId: string): Promise<PromptAnalysis> => {
  try {
    // Generate response using Blink AI
    const { text } = await blink.ai.generateText({
      prompt: prompt,
      model: 'gpt-4o-mini',
      maxTokens: 500
    })

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

### 4. Keyword Matching Algorithm
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

### 5. Real-time Progress Tracking (`AnalysisProgress.tsx`)
- Visual progress bar with percentage completion
- Individual prompt status indicators
- Color-coded status badges (pending, processing, completed, error)
- Live statistics (completed, processing, errors, pending)

### 6. Results Display (`ResultsGrid.tsx`)
- Card-based layout for each prompt/response pair
- Syntax highlighting for keyword matches
- Scrollable content areas for long text
- Status indicators and error handling
- Keyword match badges with counts

### 7. Analytics Dashboard (`AnalyticsSummary.tsx`)
- Total statistics (prompts, responses, matches, processing time)
- Top keywords ranking with frequency analysis
- Progress bars for keyword distribution
- Performance metrics

### 8. Batch Processing (`BatchAnalysis.tsx`)
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
npm install @blinkdotnew/sdk
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

### 3. Setup Blink SDK
```typescript
// src/blink/client.ts
import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'your-project-id',
  authRequired: true
})
```

### 4. Create Type Definitions
Define all interfaces in `src/types/index.ts` as shown above.

### 5. Build Core Components

#### Authentication & Layout (`App.tsx`)
- Implement auth state management with `blink.auth.onAuthStateChanged`
- Create main layout with header, navigation, and content areas
- Add sign-in/sign-out functionality

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

### 6. Implement Key Features

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

### 7. Styling & UI Polish
- Implement responsive design with Tailwind CSS
- Add loading states and animations
- Create consistent color scheme and typography
- Add hover effects and transitions

### 8. Error Handling & Validation
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
- Configurable delays between requests
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

### Blink Platform
The app is designed to run on the Blink platform with:
- Automatic authentication handling
- Built-in AI API access
- Integrated hosting and deployment
- Real-time preview and testing

### Environment Setup
- No additional API keys required (handled by Blink SDK)
- Automatic HTTPS and domain management
- Built-in error monitoring and logging

## Testing Strategy

### Unit Testing
- Component rendering and interaction
- Keyword matching algorithm accuracy
- CSV parsing functionality
- Analytics calculations

### Integration Testing
- End-to-end prompt processing flow
- Authentication state management
- API error handling
- Export functionality

### User Testing
- Usability testing for complex workflows
- Performance testing with large batches
- Cross-browser compatibility
- Mobile responsiveness

## Future Enhancements

### Potential Features
- **Advanced Analytics**: Sentiment analysis, response categorization
- **Collaboration**: Multi-user sessions and sharing
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

## Conclusion

This ChatGPT Prompt Analyzer represents a sophisticated example of modern web application development, combining:
- **Modern React patterns** with hooks and TypeScript
- **Beautiful UI design** with Tailwind CSS and ShadCN components
- **Real-time processing** with progress tracking and status updates
- **Advanced text analysis** with regex-based keyword matching
- **Comprehensive analytics** with frequency analysis and statistics
- **Batch processing** capabilities for scalable operations
- **Export functionality** for data portability

The application demonstrates best practices in:
- Component architecture and separation of concerns
- Error handling and user experience design
- Performance optimization and rate limiting
- Responsive design and accessibility
- Type safety with TypeScript
- Modern development tooling with Vite

This project serves as an excellent foundation for building similar AI-powered analysis tools and can be extended with additional features like advanced analytics, collaboration tools, and integration capabilities.