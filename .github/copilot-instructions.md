# Influencer & Brand Collaboration Platform

## Project Overview
Two-sided marketplace SaaS platform connecting influencers with brands for campaign collaborations.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage
- **Form Handling**: React Hook Form + Zod
- **State Management**: React Context API + Zustand

## Setup Progress

- [x] Verify copilot-instructions.md exists
- [x] Scaffold the Project (Next.js 14 with TypeScript)
- [x] Customize the Project (Add all features)
- [ ] Install Required Extensions
- [ ] Install Dependencies (npm install)
- [ ] Compile the Project
- [ ] Create and Run Task
- [ ] Launch the Project
- [x] Ensure Documentation is Complete

## Project Structure
```
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API service functions
│   ├── types/               # TypeScript types
│   ├── lib/                 # Utility libraries
│   ├── context/             # React Context providers
│   └── utils/               # Helper functions
├── public/                  # Static assets
└── supabase/               # Supabase migrations
```

## Key Features
1. Authentication with role-based access (influencer/brand)
2. Influencer profiles with social media stats
3. Brand company profiles
4. Collaboration request system
5. Campaign management with status workflow
6. Real-time messaging
7. Deliverables tracking

## Development Guidelines
- Use TypeScript strict mode
- Follow ESLint and Prettier configurations
- Implement Row Level Security (RLS) on all Supabase tables
- Never expose secret keys in frontend code
- Use environment variables for all sensitive data
