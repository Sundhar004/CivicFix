# CivicFix 🚀

> **Live Demo:** [https://civic-fix-pi.vercel.app/](https://civic-fix-pi.vercel.app/)

CivicFix is a modern, crowdsourced civic issue reporting platform built to bridge the gap between citizens and local authorities. Citizens can report issues with geolocated photos, and officers can claim and resolve them in real-time.

---

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Map:** React-Leaflet
- **Backend:** MongoDB, NextAuth, Cloudinary

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

2. **Environment Variables**
   Duplicate `.env.local.example` to `.env.local` and add your keys:
   ```env
   MONGODB_URI=your_mongodb_uri
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

3. **Run Locally**
   ```bash
   npm run dev
   ```
