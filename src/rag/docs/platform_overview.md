# InfluConnect Platform Overview

## What is InfluConnect?

InfluConnect is a two-sided marketplace SaaS platform that connects social media influencers with brands for campaign collaborations. The platform streamlines the entire collaboration workflow from discovery to deliverable tracking.

## Key Features

### For Influencers
- **Profile Management**: Create and manage a detailed profile showcasing your social media stats, niche, audience demographics, and past collaborations.
- **Campaign Discovery**: Browse available brand campaigns and apply to ones that match your niche.
- **Collaboration Requests**: Receive and manage collaboration requests from brands.
- **Deliverable Tracking**: Track your deliverables for active campaigns with status updates.
- **Real-time Messaging**: Communicate directly with brands through the built-in messaging system.
- **Dashboard Analytics**: View stats on your active campaigns, pending requests, and earnings.

### For Brands
- **Company Profile**: Set up a company profile with your brand details, industry, and campaign preferences.
- **Influencer Discovery**: Search and filter influencers by niche, follower count, engagement rate, and platform.
- **Campaign Management**: Create and manage marketing campaigns with defined budgets, timelines, and deliverables.
- **Collaboration Requests**: Send collaboration requests to influencers with campaign details and compensation.
- **Deliverable Review**: Review and approve influencer deliverables for active campaigns.
- **Real-time Messaging**: Communicate with influencers through the built-in chat system.

## How It Works

### Step 1: Sign Up
Users sign up and choose their role — either as an **Influencer** or a **Brand**. Email verification is handled automatically.

### Step 2: Complete Profile
After signing up, users complete their profile. Influencers add their social media stats and niche, while brands add company details and campaign preferences.

### Step 3: Discover & Connect
Brands can search for influencers using filters. Influencers can browse available campaigns. Both can send collaboration requests.

### Step 4: Collaborate
Once a collaboration is confirmed, both parties can communicate via real-time messaging, track deliverables, and manage the campaign lifecycle.

### Step 5: Complete & Review
After deliverables are submitted and approved, the campaign is marked as complete.

## Platform Architecture
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with Supabase
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with role-based access control
- **Real-time**: Supabase Realtime for messaging
- **Storage**: Supabase Storage for media files

## Security
- Row-Level Security (RLS) on all database tables
- Role-based access control (Influencer vs Brand)
- Protected routes with middleware authentication
- Environment variable management for sensitive keys
