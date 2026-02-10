# InfluConnect - Influencer & Brand Collaboration Platform

A two-sided marketplace SaaS platform connecting influencers with brands for campaign collaborations.

## 🚀 Features

### For Influencers
- **Profile Management**: Showcase your social media presence, niche, and rates
- **Collaboration Requests**: Receive and manage requests from brands
- **Campaign Tracking**: Track deliverables and progress
- **Real-time Messaging**: Communicate directly with brands
- **Earnings Dashboard**: View your collaboration earnings

### For Brands
- **Discover Influencers**: Search and filter influencers by niche, platform, and followers
- **Send Requests**: Create detailed collaboration proposals
- **Campaign Management**: Track campaign progress and deliverables
- **Review System**: Rate and review completed collaborations

### AI-Powered Chatbot
- **RAG-Based Assistant**: Context-aware chatbot trained on platform documentation
- **Instant Answers**: Get help with campaigns, profiles, collaborations, and more
- **Local TF-IDF Embeddings**: No external embedding API needed — runs locally
- **Multi-Model Fallback**: Automatically tries multiple free LLM models via OpenRouter
- **Floating Chat Widget**: Always accessible from the dashboard

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **Form Handling**: React Hook Form + Zod
- **State Management**: React Context API
- **AI/RAG**: OpenRouter API (LLM) + Local TF-IDF embeddings + In-memory vector store

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Authentication pages
│   │   ├── (dashboard)/        # Protected dashboard pages
│   │   ├── api/rag/            # RAG chatbot API routes
│   │   │   ├── chat/route.ts   # Chat endpoint (auto-ingests + LLM)
│   │   │   └── ingest/route.ts # Manual ingestion endpoint
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── auth/               # Authentication components
│   │   ├── layout/             # Layout components
│   │   ├── chat/               # RAG chatbot widget
│   │   ├── influencer/         # Influencer-specific components
│   │   ├── brand/              # Brand-specific components
│   │   ├── campaign/           # Campaign components
│   │   ├── dashboard/          # Dashboard widgets
│   │   └── messaging/          # Chat components
│   ├── rag/                    # RAG pipeline
│   │   ├── docs/               # Knowledge base (Markdown files)
│   │   ├── loader.ts           # Markdown document loader
│   │   ├── chunker.ts          # Text chunking with overlap
│   │   ├── embeddings.ts       # Local TF-IDF embeddings
│   │   ├── vectorstore.ts      # In-memory cosine similarity search
│   │   └── prompt.ts           # RAG prompt template
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # API service functions
│   ├── types/                  # TypeScript type definitions
│   ├── lib/                    # Utility libraries
│   │   ├── supabase/           # Supabase client configuration
│   │   ├── utils.ts            # Helper utilities
│   │   └── validations.ts      # Zod schemas
│   ├── context/                # React Context providers
│   └── utils/                  # Helper functions
├── supabase/
│   └── migrations/             # Database migrations
├── public/                     # Static assets
└── middleware.ts               # Next.js middleware
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Code
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the migration script:
     ```bash
     # Copy and run the contents of supabase/migrations/001_initial_schema.sql
     ```

4. **Configure environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
   
   Update the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   OPENROUTER_API_KEY=your-openrouter-api-key
   ```

   > Get a free OpenRouter API key at [openrouter.ai/keys](https://openrouter.ai/keys). Enable the "Allow free endpoints" privacy toggle in [settings](https://openrouter.ai/settings/privacy).

5. **Set up Supabase Storage**
   
   Create storage buckets in Supabase:
   - `profile-pictures` - For user profile images
   - `company-logos` - For brand logos
   - `attachments` - For message attachments

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Build
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint

# Type checking
npm run type-check   # Run TypeScript compiler check
```

## 🔐 Authentication Flow

1. Users sign up choosing their role (Influencer or Brand)
2. Email verification is handled by Supabase
3. On first login, users complete their profile
4. Protected routes are guarded by middleware

## 📊 Database Schema

### Core Tables
- **users**: Base user information and role
- **influencers**: Influencer-specific profile data
- **brands**: Brand/company profile data
- **collaboration_requests**: Pending collaboration proposals
- **campaigns**: Active/completed collaborations
- **deliverables**: Campaign deliverables with status tracking
- **messages**: Real-time chat messages
- **reviews**: Post-campaign reviews and ratings

### Key Features
- Row Level Security (RLS) on all tables
- Automatic campaign creation when request is accepted
- Progress tracking based on deliverable completion
- Real-time updates for messages and deliverables

## 🎨 UI Components

The project uses a custom implementation of shadcn/ui components:

- Button, Input, Textarea, Label
- Card, Avatar, Badge
- Select, Checkbox, Progress
- Tabs, Dialog, Dropdown Menu
- Separator, ScrollArea, Tooltip
- Loading spinner

## 🤖 RAG Chatbot Architecture

The platform includes an AI-powered assistant built with a Retrieval-Augmented Generation (RAG) pipeline:

1. **Knowledge Base** — Markdown docs in `src/rag/docs/` covering platform features, FAQs, and guidelines
2. **Ingestion** — Docs are loaded → split into overlapping 500-char chunks → converted to TF-IDF vectors
3. **Search** — User queries are vectorized and matched against chunks via cosine similarity
4. **Generation** — Top-K relevant chunks are injected into a prompt sent to a free LLM via OpenRouter
5. **Fallback** — 8 free models are tried in sequence (Gemma, Llama, DeepSeek, Qwen, Mistral, etc.)
6. **Auto-Ingest** — On Vercel serverless, the chat route auto-loads the knowledge base on cold start

The chatbot appears as a floating widget on all dashboard pages.

## 🔒 Security

- All API calls use Supabase RLS policies
- Sensitive operations require authentication
- Role-based access control for routes
- Environment variables for secrets

## 📱 Responsive Design

The platform is fully responsive with:
- Mobile-first approach
- Collapsible sidebar navigation
- Adaptive grid layouts
- Touch-friendly interactions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [OpenRouter](https://openrouter.ai/) - Free LLM API gateway
