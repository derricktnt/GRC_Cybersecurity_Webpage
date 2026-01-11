# GRC & Cybersecurity Portal

A modern, production-ready web application for Governance, Risk, and Compliance (GRC) management with real-time cybersecurity monitoring capabilities.

## Live Demo

**[View Live Application](https://grc-cybersecurity-we-jg9c.bolt.host)**

Try Demo Mode for instant access without registration.

## Overview

This full-stack security management platform provides organizations with comprehensive tools to monitor API keys, track IP addresses, generate compliance reports, and maintain security posture. Built with enterprise-grade technologies and security best practices.

## Key Features

### Security Management
- **API Key Monitoring** - Track and manage API keys with status indicators, usage metrics, and expiration alerts
- **IP Address Monitoring** - Real-time IP address tracking with geolocation, threat detection, and activity logs
- **Security Dashboard** - Live security score (92/100), 24/7 active monitoring, and compliance status tracking

### Reporting & Analytics
- **Compliance Reports** - SOC2 and ISO 27001 compliance documentation with export capabilities
- **Security Audit Logs** - Detailed activity tracking for all security-related events
- **Risk Assessment** - Automated risk scoring and vulnerability identification

### Authentication & Access Control
- **Secure Authentication** - Email/password authentication powered by Supabase Auth
- **Demo Mode** - Instant access for demonstrations and testing
- **Session Management** - Secure session handling with automatic timeout

## Technical Stack

### Frontend
- **React 18** - Modern UI with hooks and functional components
- **TypeScript** - Type-safe development with full IDE support
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first responsive design system
- **Lucide React** - Clean, professional icon library

### Backend & Database
- **Supabase** - PostgreSQL database with real-time capabilities
- **Row Level Security (RLS)** - Database-level access control
- **Edge Functions** - Serverless functions for data seeding and processing
- **RESTful API** - Type-safe API integration

### DevOps & Tools
- **ESLint** - Code quality and consistency enforcement
- **TypeScript Compiler** - Static type checking
- **Git** - Version control with structured commits
- **npm** - Dependency management

## Architecture Highlights

- **Component-Based Design** - Modular, reusable React components
- **Security-First Approach** - RLS policies, secure authentication, no exposed credentials
- **Responsive Layout** - Mobile-first design with breakpoints for all devices
- **Real-Time Updates** - Live data synchronization via Supabase subscriptions
- **Error Handling** - Comprehensive error boundaries and user feedback
- **Type Safety** - End-to-end TypeScript for reduced runtime errors

## Database Schema

Secure PostgreSQL database with:
- `api_keys` - API key management with encrypted storage
- `ip_addresses` - IP tracking with geolocation data
- `security_events` - Audit logs for security events
- `compliance_reports` - Generated compliance documentation

All tables protected with Row Level Security policies.

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for full functionality)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/grc-cybersecurity-portal.git

# Navigate to project directory
cd grc-cybersecurity-portal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials to .env

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run typecheck # Run TypeScript compiler
```

## Development Practices

- **Clean Code** - Consistent formatting and naming conventions
- **Component Isolation** - Single responsibility principle
- **State Management** - React hooks for local state, Supabase for persistence
- **Security Standards** - OWASP top 10 compliance
- **Accessibility** - Semantic HTML and ARIA labels
- **Performance** - Code splitting and lazy loading

## Security Features

- Authentication with secure session management
- Row Level Security for database access control
- Environment variable protection
- XSS and CSRF protection
- Input validation and sanitization
- Secure API communication

## Future Enhancements

- Multi-factor authentication (MFA)
- Advanced threat intelligence integration
- Automated vulnerability scanning
- Role-based access control (RBAC)
- Email notifications for security events
- Mobile application

## Contributing

This project showcases modern web development practices and security implementation. Feedback and suggestions are welcome.

## License

MIT License - feel free to use this project as a reference or template.

## Contact

**Portfolio Project by [Derrick D]**

- GitHub: (https://github.com/derricktnt)
- LinkedIn: www.linkedin.com/in/
derrick-d-9a4ab743
Vanity URL name

- Email: derricktnt0817@gmail.com

---

Built with modern web technologies to demonstrate full-stack development capabilities, security best practices, and production-ready application architecture.
