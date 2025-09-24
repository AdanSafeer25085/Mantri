# Construction Management System - Deployment Guide

## 🚀 Project Overview
Modern construction management system built with React and Supabase, migrated from MongoDB architecture.

## 📋 Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account with project set up

## 🔧 Environment Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd construction
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Setup
Run the following SQL in your Supabase SQL Editor:

```sql
-- Add required columns to admins table
ALTER TABLE admins
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS mobile TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS plain_password TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);
CREATE INDEX IF NOT EXISTS idx_admins_mobile ON admins(mobile);
CREATE INDEX IF NOT EXISTS idx_admins_job_title ON admins(job_title);

-- Update any existing admin records to have default values
UPDATE admins SET
  job_title = COALESCE(job_title, 'Administrator'),
  status = COALESCE(status, 'Active')
WHERE job_title IS NULL OR status IS NULL;
```

## 🏃‍♂️ Running the Application

### Development
```bash
npm run dev
```
Access at: http://localhost:5173/

### Production Build
```bash
npm run build
npm run preview
```

## 🎯 Key Features
- ✅ Project Management with Interactive Maps
- ✅ Material & Contractor Management
- ✅ Customer & Lead Tracking
- ✅ Stock Management
- ✅ Finance Tracking
- ✅ File Upload (Technical & Legal)
- ✅ Role-based Admin Management
- ✅ Responsive Design (Mobile, Tablet, Desktop)

## 🔐 Default Login
- Username: `admin` or `adil`
- Password: [Set in Supabase database]

## 📱 Responsive Design
- Mobile-first responsive design
- Works on all screen sizes
- Touch-friendly interface

## 🛠 Build Information
- **Framework**: React 19.1.1 with Vite 7.1.6
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4.1.13
- **Icons**: React Icons 5.5.0
- **Maps**: Leaflet for project location selection
- **Bundle Size**: ~774KB (compressed: ~198KB)

## 📦 Deployment Options

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Upload `dist` folder to Netlify
3. Configure environment variables

### Traditional Hosting
1. Build the project: `npm run build`
2. Upload contents of `dist` folder to web server
3. Configure web server to handle SPA routing

## ⚠️ Known Issues
- Some ESLint warnings remain (non-breaking)
- Large bundle size (consider code splitting for optimization)
- Plain text password storage (implement proper hashing in production)

## 🔧 Production Optimizations
- Environment variables properly configured
- Build process optimized
- Assets minified and compressed
- PWA-ready structure

## 📞 Support
For deployment issues, check:
1. Environment variables are correctly set
2. Supabase database is properly configured
3. All SQL migration scripts have been run
4. Build completes successfully

---
**Migration Status**: ✅ Complete - Ready for production deployment