# InfluConnect Setup Guide

## ✅ Current Status
- **Development Server**: Running on `http://localhost:3000`
- **Node.js**: v20.19.6
- **npm**: 10.8.2
- **Dependencies**: Installed & vulnerabilities fixed

## 🚀 Next Steps: Supabase Configuration

### Why Supabase (Not Firebase)?
This project uses **Supabase** because it provides:
- **PostgreSQL** database (more powerful than Firestore)
- **Row-Level Security (RLS)** for fine-grained access control
- **Real-time subscriptions** built-in
- **Storage** for files
- **Auth** with email/password
- **Realtime Database** capabilities
- Open-source alternative to Firebase

---

## 📋 Supabase Setup Instructions

### 1. Create a Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub or email
3. Create a new organization

### 2. Create a New Project
1. Click "New Project"
2. Fill in:
   - **Name**: `influencer-brand-collaboration`
   - **Database Password**: Save this somewhere safe
   - **Region**: Choose closest to you (e.g., `us-east-1`)
   - **Pricing**: Free tier is fine for development
3. Click "Create new project" (wait ~3 min for setup)

### 3. Get Your API Keys
1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon Key** (public, safe to expose)
   - **Service Role Key** (keep secret!)

### 4. Update Environment Variables
Edit `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# For local development
SUPABASE_JWT_SECRET=your-jwt-secret-from-auth-settings
```

**Where to find each value:**
- `NEXT_PUBLIC_SUPABASE_URL`: Project Settings → API → "URL"
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project Settings → API → Under "Project API keys" → "anon"
- `SUPABASE_SERVICE_ROLE_KEY`: Project Settings → API → Under "Project API keys" → "service_role"
- `SUPABASE_JWT_SECRET`: Project Settings → Auth → "JWT Secret"

### 5. Run Database Migration
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of: `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" (green button)

This creates all tables with Row-Level Security (RLS) policies.

### 6. Enable Real-time
1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - `messages`
   - `deliverables`
   - `campaigns`

---

## 🔑 Environment Variables Explained

| Variable | Type | Where to Put |
|----------|------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | `.env.local` ✅ Safe in repo |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | `.env.local` ✅ Safe in repo |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | `.env.local` ⚠️ NEVER commit |
| `SUPABASE_JWT_SECRET` | Secret | `.env.local` ⚠️ NEVER commit |

**Important**: The `.env.local` file is already in `.gitignore`, so it won't be committed.

---

## 🧪 Test the Connection

Run this in the browser console at `http://localhost:3000`:

```javascript
// Test connection (after logging in)
const { data, error } = await fetch('/api/test', {
  headers: { 'Content-Type': 'application/json' }
}).then(r => r.json());

console.log(data || error);
```

---

## 📱 First Run - What to Expect

1. **Landing Page** (`/`)
   - Shows features and sign-up CTAs
   - No auth required

2. **Sign Up** (`/signup`)
   - Choose role: Influencer or Brand
   - Create account in Supabase Auth
   - Profile creation happens after signup

3. **Dashboard** (`/dashboard`)
   - Role-based dashboard
   - Stats widgets
   - Active campaigns
   - Quick action links

4. **Features Available**:
   - Browse influencers (brands only)
   - View collaboration requests
   - Manage campaigns
   - Real-time messaging
   - Profile settings

---

## 🔒 Security Features Enabled

✅ **Row-Level Security (RLS)** - Users can only see their own data
✅ **Auth Middleware** - Protected routes require login
✅ **Role-Based Access** - Influencers/Brands see different features
✅ **API Rate Limiting** - Prevents abuse (configured on Supabase)
✅ **CORS** - Only allows your domain

---

## 📦 Project Structure
```
src/
├── app/                 # Next.js pages & routes
├── components/          # React components
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── types/              # TypeScript types
├── lib/                # Utilities & Supabase clients
├── context/            # React Context (Auth, Toast)
└── utils/              # Helper functions
```

---

## 🐛 Troubleshooting

**Error: "Cannot find module '@supabase/ssr'"**
- Solution: Run `npm install` again

**Error: "NEXT_PUBLIC_SUPABASE_URL is not set"**
- Solution: Check `.env.local` has correct values
- Restart dev server: `npm run dev`

**Error: "Unauthorized" when making requests**
- Solution: Make sure you're logged in
- Check RLS policies in Supabase dashboard
- Verify service role key in backend

**Database migration fails**
- Solution: Check SQL syntax in Supabase editor
- Look for error messages and copy exact line
- Tables might already exist - check "Existing tables"

---

## 🚀 Deploy to Production

When ready to deploy:

1. **Vercel** (recommended for Next.js)
   - Connect GitHub repo
   - Add environment variables in Settings → Environment Variables
   - Auto-deploys on push to main

2. **Environment Variables on Vercel**
   - Add all `.env.local` variables
   - Never expose `SUPABASE_SERVICE_ROLE_KEY` to frontend

3. **Database**
   - Supabase project stays same
   - Same URL and keys work in production

---

## 📚 Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth/overview)
- [RLS Examples](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime/overview)

---

## ✨ What's Next?

After setting up Supabase:

1. **Test Authentication**
   - Sign up as influencer
   - Sign up as brand
   - Verify profiles created in database

2. **Create Test Data**
   - Add sample influencers
   - Send collaboration requests
   - Track campaigns

3. **Build Custom Pages**
   - Customize forms
   - Add more features
   - Integrate payment (Stripe)

---

**Questions?** Check the project documentation or Supabase support.
