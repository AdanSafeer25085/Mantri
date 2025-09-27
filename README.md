# Construction Management System

A comprehensive construction project management system built with React and Supabase.

## 🚀 Features

- **Project Management**: Create and manage construction projects
- **Role-based Access Control**: Admin and user management with custom permissions
- **Stock Management**: Track materials, vendors, and contractors
- **Financial Tracking**: Monitor project finances and expenses
- **Task Management**: Gantt charts and project timelines
- **File Management**: Upload and organize technical and legal documents
- **Customer & Lead Management**: Track customers and potential leads
- **Reporting**: Generate comprehensive project reports

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd construction
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL migration script in Supabase SQL Editor:
     ```bash
     # Copy content from supabase_migration.sql and run in Supabase SQL Editor
     ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔑 Default Login Credentials

After running the migration script, you can log in with:

- **Username**: `admin` / **Password**: `admin123`
- **Username**: `adil` / **Password**: `adil123`

⚠️ **IMPORTANT**: Change these passwords in production!

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── frontend/           # React components
├── lib/               # Utilities and Supabase config
└── index.css         # Global styles

supabase_migration.sql # Complete database setup
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

### Supabase Setup

1. Create a new Supabase project
2. Copy your project URL and anon key
3. Run the `supabase_migration.sql` script in the SQL Editor
4. Verify tables are created successfully

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## 🔒 Security

- Environment variables are required (no hardcoded secrets)
- Row Level Security (RLS) policies implemented
- Admin role-based access control
- Secure password handling

## 📊 Database Schema

The system includes the following main tables:
- `users` - User authentication
- `admins` - Admin permissions and roles
- `projects` - Construction projects
- `activities` - Project activities
- `materials`, `stocks` - Inventory management
- `customers`, `leads` - Customer relationship management
- `finances` - Financial tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is proprietary software.

## 🆘 Support

For support, please contact the development team.
