# CivicFix

Crowdsourced Civic Issue Reporting MVP.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Map:** React-Leaflet
- **Backend:** Supabase (PostgreSQL, Auth, Storage)

## Core User Flows
1. **Citizen:** Report a pothole or civic issue with a photo + GPS, viewable on a public map.
2. **Officer:** Claims issue, uploads fixed photo, marks as resolved.
3. **Status:** Real-time visual status updates (Open → Claimed → Fixed).

## Setup Instructions

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd civicfix
   npm install
   ```

2. **Supabase Environment**
   Duplicate `.env.local.example` to `.env.local` and add your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ```

3. **Database Schema**
   Run the SQL provided in `supabase/sql/schema.sql` inside your Supabase SQL Editor.
   Create a storage bucket named `issues` and set the policy to 'public' for images.

4. **Run Locally**
   ```bash
   npm run dev
   ```

## 1-Click Vercel Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fexample%2Fcivicfix)

*Note: Make sure to add your Supabase environment variables in the Vercel dashboard Settings -> Environment Variables before deploying.*
