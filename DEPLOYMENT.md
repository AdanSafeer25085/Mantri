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
Run the complete migration script in your Supabase SQL Editor:

**Run the complete migration (IMPORTANT)**
```sql
-- Copy and paste the ENTIRE contents of supabase_migration.sql
-- into Supabase SQL Editor and run it
-- This includes:
-- ✅ All database tables and relationships
-- ✅ Project isolation (materials, stocks etc. are project-specific)
-- ✅ Cascade deletion (deleting project deletes all related data)
-- ✅ Admin permissions system
-- ✅ Performance indexes and Row Level Security
-- ✅ Automatic testing and verification
```

The migration script is comprehensive and includes:
- **Steps 1-27**: Core database schema and tables
- **Step 28**: Project isolation with CASCADE foreign keys
- **Step 29**: Admin table fixes for permissions system
- **Step 30**: Data linking for existing records
- **Step 31**: Automatic cascade deletion testing
- **Step 32**: Verification queries to ensure setup is correct

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