# RateMyStartup 🚀

AI-powered startup stage analysis platform built with Next.js 14 and Supabase.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Trend25/nextjs-hqe9dcff)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://www.ratemystartup.info)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🤖 **AI-Powered Analysis** - Intelligent startup stage detection and recommendations
- 📊 **Comprehensive Dashboard** - Track submissions, analyses, and insights  
- 🔐 **Secure Authentication** - Email verification with Row Level Security (RLS)
- 📱 **Responsive Design** - Mobile-first approach for all devices
- ⚡ **Real-time Updates** - Live analysis status and notifications
- 📈 **Industry Benchmarks** - Compare your startup with industry standards
- 🎯 **Stage Detection** - Identify whether you're in Idea, MVP, Growth, or Scale stage

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (Database, Auth, RLS, Edge Functions)
- **Database:** PostgreSQL with Row Level Security
- **Hosting:** Vercel (Production), Supabase (Database)
- **Authentication:** Supabase Auth with email verification
- **Styling:** Tailwind CSS with custom components
- **AI:** OpenAI GPT-4 (planned integration)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or later
- **Git** for version control
- **Supabase account** (free tier available)
- **Vercel account** (optional, for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Trend25/nextjs-hqe9dcff.git
   cd nextjs-hqe9dcff
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Setup Supabase Database**
   
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the schema files from `/sql/` directory:
     - `01_initial_schema.sql` - Basic tables
     - `02_rls_policies.sql` - Security policies
     - `03_functions.sql` - Database functions
   
   Or use the Supabase CLI:
   ```bash
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) 🎉

## 📊 Database Schema

The application uses a PostgreSQL database with the following main tables:

- **`profiles`** - User profiles and preferences
- **`startup_submissions`** - Startup data and information submissions  
- **`stage_analysis_results`** - AI analysis results and recommendations
- **`startup_benchmarks`** - Industry benchmarks and metrics
- **`audit_logs`** - Security and activity logging

All tables are protected with Row Level Security (RLS) policies to ensure data privacy.

## 🔐 Security Features

- **Row Level Security (RLS)** on all tables
- **Email verification** required for account activation
- **JWT-based authentication** with secure session management
- **Audit logging** for important actions
- **Input validation** and sanitization
- **Rate limiting** on authentication endpoints

## 🎯 How It Works

1. **Sign Up** - Create account with email verification
2. **Submit Startup Data** - Fill out comprehensive startup information form
3. **AI Analysis** - Our AI analyzes your data and determines your startup stage
4. **Get Insights** - Receive detailed analysis with actionable recommendations
5. **Track Progress** - Monitor your startup's evolution over time

## 📱 Screenshots

| Dashboard | Analysis Form | Results |
|-----------|--------------|---------|
| ![Dashboard](docs/images/dashboard.png) | ![Form](docs/images/form.png) | ![Results](docs/images/results.png) |

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **One-click deploy:**
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Trend25/nextjs-hqe9dcff)

2. **Manual deployment:**
   ```bash
   npm run build
   vercel --prod
   ```

3. **Add environment variables in Vercel:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add your Supabase URL and anon key

### Deploy to Other Platforms

- **Netlify:** Connect repository and set build command to `npm run build`
- **Railway:** One-click deploy from GitHub
- **Digital Ocean:** Use App Platform with Next.js preset

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report bugs** - Create detailed bug reports
- ✨ **Suggest features** - Propose new features or improvements
- 📝 **Improve documentation** - Help make docs clearer
- 🔧 **Submit code** - Fix bugs or implement features
- 🎨 **Design improvements** - UI/UX enhancements

### Development Process

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes with clear commit messages
4. **Test** your changes thoroughly
5. **Submit** a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📊 Project Status

- ✅ **Authentication System** - Complete
- ✅ **Dashboard & UI** - Complete  
- ✅ **Form System** - Complete
- ✅ **Database & Security** - Complete
- 🔄 **AI Analysis Engine** - In Progress
- 📋 **Email Notifications** - Planned
- 💳 **Payment Integration** - Planned

## 🗺️ Roadmap

### Q1 2025
- [x] Core platform development
- [x] Authentication and security
- [ ] AI analysis integration
- [ ] Email notification system

### Q2 2025
- [ ] Advanced analytics dashboard
- [ ] API endpoints for developers
- [ ] Mobile app development
- [ ] Team collaboration features

### Q3 2025
- [ ] Enterprise features
- [ ] Advanced AI models
- [ ] Third-party integrations
- [ ] International expansion

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ **Commercial use** allowed
- ✅ **Modification** allowed
- ✅ **Distribution** allowed
- ✅ **Private use** allowed
- ⚠️ **No warranty** provided

## 🙏 Acknowledgments

Special thanks to:

- **[Supabase](https://supabase.com)** - For the amazing Backend-as-a-Service platform
- **[Vercel](https://vercel.com)** - For seamless deployment and hosting
- **[Tailwind CSS](https://tailwindcss.com)** - For the utility-first CSS framework
- **[Next.js Team](https://nextjs.org)** - For the incredible React framework
- **Open Source Community** - For inspiration and continuous learning

## 📞 Support & Community

- 📧 **Email:** support@ratemystartup.info
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/Trend25/nextjs-hqe9dcff/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/Trend25/nextjs-hqe9dcff/discussions)
- 🐦 **Twitter:** 
- 💼 **LinkedIn:** 

## 🌟 Show Your Support

If this project helped you, please consider:

- ⭐ **Starring** the repository
- 🐛 **Reporting** any issues you find
- 📝 **Contributing** to the codebase
- 💬 **Sharing** with other developers
- ☕ **Sponsoring** the development (coming soon)

---

**Built with ❤️ for the startup community**

*Empowering entrepreneurs with AI-driven insights to build better startups.*
