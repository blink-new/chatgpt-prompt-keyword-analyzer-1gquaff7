# ChatGPT Prompt Analyzer & Keyword Tracker - Project Structure

## Overview
An automated agent that processes 10 prompts through ChatGPT, saves responses, scans for specific keywords, and displays results in a beautiful web interface with analytics and insights.

## Tech Stack
- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS + ShadCN UI
- **Backend**: Blink SDK (Auth, Database, AI)
- **Icons**: Lucide React

## Design System
- **Primary Color**: #6366F1 (Indigo)
- **Accent Color**: #10B981 (Emerald)
- **Background**: #FAFAFA (Light Gray)
- **Dark Mode**: #0F172A (Slate)
- **Fonts**: Inter, Inter Medium

## Project Structure

```
├── components.json                 # ShadCN UI configuration
├── eslint.config.js               # ESLint configuration
├── index.html                     # Main HTML entry point
├── package.json                   # Dependencies and scripts
├── postcss.config.cjs             # PostCSS configuration
├── tailwind.config.cjs            # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite configuration
├── public/
│   ├── _redirects                 # Netlify redirects
│   ├── favicon.svg                # App favicon
│   └── vite.svg                   # Vite logo
└── src/
    ├── App.tsx                    # Main application component
    ├── main.tsx                   # React entry point
    ├── index.css                  # Global styles and CSS variables
    ├── vite-env.d.ts             # Vite type definitions
    ├── blink/
    │   └── client.ts              # Blink SDK client configuration
    ├── components/
    │   ├── AnalysisProgress.tsx   # Progress tracking component
    │   ├── AnalyticsSummary.tsx   # Analytics dashboard component
    │   ├── KeywordConfig.tsx      # Keyword configuration panel
    │   ├── PromptInput.tsx        # Prompt input section
    │   ├── ResultsGrid.tsx        # Results display grid
    │   └── ui/                    # ShadCN UI components
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── input.tsx
    │       ├── textarea.tsx
    │       ├── progress.tsx
    │       ├── badge.tsx
    │       ├── alert.tsx
    │       ├── tabs.tsx
    │       └── [other ShadCN components]
    ├── hooks/
    │   ├── use-mobile.tsx         # Mobile detection hook
    │   └── use-toast.ts           # Toast notification hook
    ├── lib/
    │   └── utils.ts               # Utility functions (cn, etc.)
    └── types/
        └── index.ts               # TypeScript type definitions
```

## Key Components

### 1. App.tsx
Main application component that orchestrates the entire flow:
- Manages application state
- Handles prompt processing workflow
- Coordinates between all child components

### 2. PromptInput.tsx
Input section for entering prompts:
- Textarea for prompt input
- Add/remove prompt functionality
- Validation for 10 prompt limit
- Batch import/export capabilities

### 3. KeywordConfig.tsx
Keyword configuration panel:
- Input field for target keywords
- Case-sensitive toggle
- Multiple keyword support
- Keyword validation

### 4. AnalysisProgress.tsx
Real-time progress tracking:
- Progress bar with percentage
- Current processing status
- Animated indicators
- Error handling display

### 5. ResultsGrid.tsx
Results display with response cards:
- Grid layout for responses
- Keyword highlighting
- Response metadata
- Export functionality

### 6. AnalyticsSummary.tsx
Analytics dashboard:
- Keyword occurrence statistics
- Success/failure rates
- Processing time metrics
- Visual charts and graphs

## Data Flow

1. **Input Phase**: User enters 10 prompts and configures keywords
2. **Processing Phase**: Prompts are sent to ChatGPT API via Blink SDK
3. **Analysis Phase**: Responses are scanned for keyword matches
4. **Storage Phase**: Results are saved to Blink database
5. **Display Phase**: Results are presented in beautiful UI with analytics

## Database Schema

```sql
-- Prompts table
CREATE TABLE prompts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Responses table
CREATE TABLE responses (
  id TEXT PRIMARY KEY,
  prompt_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  processing_time INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prompt_id) REFERENCES prompts(id)
);

-- Keyword matches table
CREATE TABLE keyword_matches (
  id TEXT PRIMARY KEY,
  response_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  match_count INTEGER DEFAULT 0,
  positions TEXT, -- JSON array of match positions
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (response_id) REFERENCES responses(id)
);

-- Analysis sessions table
CREATE TABLE analysis_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  keywords TEXT NOT NULL, -- JSON array of keywords
  total_prompts INTEGER DEFAULT 10,
  completed_prompts INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);
```

## Key Features

### Core Functionality
- ✅ Batch process 10 prompts through ChatGPT API
- ✅ Configurable keyword detection with case-insensitive matching
- ✅ Real-time progress tracking with animated indicators
- ✅ Beautiful response cards with syntax highlighting
- ✅ Keyword occurrence analytics and statistics

### UI/UX Features
- ✅ Responsive design for desktop and mobile
- ✅ Modern, clean interface with Tailwind CSS
- ✅ ShadCN UI components for consistency
- ✅ Real-time updates and progress indicators
- ✅ Export functionality for results

### Technical Features
- ✅ TypeScript for type safety
- ✅ Blink SDK integration for backend services
- ✅ Local storage backup for data persistence
- ✅ Error handling and validation
- ✅ Performance optimizations

## Setup Instructions

1. **Initialize Vite React TypeScript project**
2. **Install dependencies**:
   ```bash
   npm install @blinkdotnew/sdk
   npm install -D tailwindcss postcss autoprefixer
   npm install lucide-react
   npm install @radix-ui/react-*  # ShadCN dependencies
   ```
3. **Configure Tailwind CSS** with custom color palette
4. **Set up ShadCN UI** components
5. **Configure Blink SDK** client
6. **Create database tables** using Blink SQL
7. **Implement components** following the structure above
8. **Add authentication** and user management
9. **Test and deploy**

## Environment Variables
- No frontend environment variables needed
- Blink SDK handles all backend configuration
- OpenAI API key managed through Blink secrets

## Deployment
- Hosted on Blink platform: `{projectId}.live.blink.new`
- Automatic deployment on code changes
- Built-in CDN and SSL certificate

## Development Workflow
1. Design → User Confirmation → Implementation
2. Component-by-component development
3. Real-time testing with preview URL
4. Version control with Blink versioning
5. Continuous deployment

This structure provides a complete blueprint for recreating the ChatGPT Prompt Analyzer & Keyword Tracker project with all necessary technical details and implementation guidance.