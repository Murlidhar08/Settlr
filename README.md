<div align="center">
  <img src="public/images/logo/light_logo.png" width="100" height="100" alt="Next Auth Template Logo">
  <h1>Next.js Better Auth Template</h1>
  <p><b>Enterprise-grade, full-stack Next.js 16 starter featuring Better Auth, Prisma ORM, Role-Based Access Control, and modern glassmorphic UI.</b></p>

  <p>
    <a href="#-using-this-template-to-create-a-new-project"><strong>Quick Start</strong></a> •
    <a href="#-key-features"><strong>Features</strong></a> •
    <a href="ARCHITECTURE.md"><strong>Architecture</strong></a> •
    <a href="AGENTS.md"><strong>AI Guidelines</strong></a> •
    <a href="#-tech-stack"><strong>Tech Stack</strong></a> •
    <a href="#-docker-setup"><strong>Docker</strong></a> •
    <a href="#-staying-in-sync-with-the-template"><strong>Sync Updates</strong></a>
  </p>
</div>

---

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Better Auth](https://img.shields.io/badge/Better_Auth-FF4154?style=for-the-badge&logo=auth0&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

---

## 🌟 Overview

**Next.js Better Auth Template** is a battle-tested, batteries-included template for building secure and scalable SaaS applications. It takes care of all authentication ceremonies, user management, profile settings, RBAC (Role-Based Access Control), security protections, and containerized deployment so you can jump straight into building your core product.

---

## ✨ Key Features

### 🔐 Complete Authentication System ([Better Auth](https://www.better-auth.com/))
- **Email & Password**: Secure credential sign-up, sign-in, and verification.
- **Password Reset Flow**: Single-use token reset with an option to revoke all active sessions across devices.
- **Social OAuth Providers**: One-click sign-in with **Google**, **Discord**, and **Facebook**.
- **Passkeys & WebAuthn**: Passwordless, biometric, and security-key authentication (`@better-auth/passkey`).
- **Two-Factor Authentication (2FA)**: TOTP authenticator app support (Google Authenticator, Authy) and emergency backup codes.
- **Multi-Session Management**: Inspect active sessions (IP address, user agent, expiration) and revoke any session or all other sessions.
- **Bot Protection & Security**: Cloudflare Turnstile CAPTCHA integration and HaveIBeenPwned leaked password verification.
- **Account Deletion Flow**: Multi-step account deletion with email confirmation and automatic cleanup hooks.

### 👤 User Settings & Account Management
- **Profile Center**: Editable avatar upload, username, display username, contact number, and biography.
- **Linked Accounts**: Link or unlink multiple OAuth providers to a single user account.
- **Passkey Hub**: Add, rename, or remove registered biometric/hardware passkeys.
- **Security Hub**: Change password with session revocation options and toggle two-factor authentication.
- **Danger Zone**: Self-serve account removal with verified token workflows.

### 🛡️ Admin Dashboard & Access Control (RBAC)
- **Role-Based Access Control**: Granular permissions across `admin`, `moderator`, and `user` roles using AccessControl.
- **User Approval Pipeline**: Status lifecycles (`pendingapproval`, `approved`, `suspended`, `banned`).
- **User Management Tools**: Search, filter, change roles, ban/unban with custom reasons, revoke user sessions, trigger password resets, impersonate users for debugging, and send direct emails.
- **Setup Wizard**: Automated `/setup` onboarding for first-time instance initialization.

### 🎨 Modern UI & Developer Experience
- **Next.js 16 (App Router)** with React 19 and Turbopack dev server.
- **Tailwind CSS 4**: Next-gen styling with curated color systems and glassmorphic designs.
- **Framer Motion**: Smooth page transitions and interactive micro-animations.
- **TanStack React Query v5**: Data fetching, caching, and state management with DevTools.
- **React Hook Form + Zod v4**: Type-safe validation with seamless schema integration.
- **PWA Ready**: Offline fallback and installable app capabilities via `@ducanh2912/next-pwa`.
- **Themes**: System, Light, and Dark modes powered by `next-themes`.

---

## 🚀 Using this Template to Create a New Project

You can use this repository as a GitHub template to instantly spin up your new application.

### Option A: Using GitHub Web Interface (Recommended)

1. Open [**next-auth-template** on GitHub](https://github.com/Murlidhar08/next-auth-template).
2. Click the green **"Use this template"** button at the top right of the repository.
3. Select **"Create a new repository"**.
4. Choose an owner, enter your new repository name (e.g. `my-awesome-app`), choose Public or Private, and click **"Create repository"**.
5. Clone your newly created repository to your local machine:
   ```bash
   git clone https://github.com/<your-username>/<my-awesome-app>.git
   cd <my-awesome-app>
   ```

### Option B: Using GitHub CLI (`gh`)

If you have GitHub CLI installed, create and clone your new project in a single command:

```bash
gh repo create my-awesome-app --template Murlidhar08/next-auth-template --public --clone
cd my-awesome-app
```

---

## 💻 Local Development Setup

Follow these steps once you have created and cloned your project:

### 1. Prerequisites
- **Node.js**: v22 or higher
- **PostgreSQL**: Local PostgreSQL instance, Docker container, or hosted database (e.g. Supabase, Neon)
- **Package Manager**: `npm`, `pnpm`, or `bun`

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```
Copy `.env.example` to create your production `.env.production`:
```bash
cp .env.example .env.production
```

Open `.env` and configure your settings:
```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_NAME="My Awesome App"
NEXT_PUBLIC_APP_DESCRIPTION="My application built with Next.js and Better Auth"
ADVANCE_PASS_CHECK=true

# Better Auth Secret (generate with: openssl rand -base64 32)
# https://www.better-auth.com/docs/installation#set-environment-variables
BETTER_AUTH_SECRET="your-32-character-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_TRUSTED_ORIGINS="http://localhost:3000"

# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/my_app?schema=public"

# OAuth Providers (Optional for local dev)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""

# Cloudflare Turnstile Bot Protection (Optional for local dev)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""
```

### 4. Initialize Database & Prisma
Push the Prisma schema to your PostgreSQL database and generate the Prisma Client:
```bash
npx prisma db push
npm run db:generate
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!TIP]
> Visit [http://localhost:3000/setup](http://localhost:3000/setup) on first run to configure the initial administrator account.

---

## 🔄 Staying in Sync with the Template

When improvements, security patches, or new features are added to `next-auth-template`, you can easily sync them into your downstream project!

### 1. Add Template as Upstream Remote (One-time setup)
Inside your project directory, run:
```bash
git remote add upstream https://github.com/Murlidhar08/next-auth-template.git
```

### 2. Pull Updates Anytime
Whenever you want to fetch and merge upstream template updates:
```bash
npm run sync-template
```
*This command runs `git fetch upstream && git merge upstream/main` under the hood, allowing you to resolve any project-specific merge conflicts while preserving your custom business logic.*

---

## 🐳 Docker Deployment

The template includes complete Docker configurations for production and development.

### Option 1: Full Stack (App + PostgreSQL + Prisma Studio)
Runs the application along with PostgreSQL and Prisma Studio:
```bash
docker-compose up -d --build
```
- **App**: [http://localhost:3000](http://localhost:3000)
- **Prisma Studio**: [http://localhost:5555](http://localhost:5555)

### Option 2: Using an External Database
If you use a hosted database (e.g., AWS RDS, Supabase, Neon):
```bash
docker-compose -f docker-compose-without-db.yml up -d --build
```

### Option 3: Local Container Development
To build and test local image changes:
```bash
docker-compose -f docker-compose-dev.yml up -d --build
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts development server with Turbopack |
| `npm run build` | Builds the production bundle with Webpack |
| `npm run start` | Runs the compiled production server |
| `npm run lint` | Runs ESLint checks |
| `npm run typecheck` | Checks TypeScript compilation without emitting files |
| `npm run db:generate` | Generates the Prisma Client |
| `npm run db:deploy` | Runs Prisma migrations and regenerates the client |
| `npm run db:studio` | Launches Prisma Studio GUI at `localhost:5555` |
| `npm run auth:generate`| Generates Better Auth schema migrations from config |
| `npm run analyze` | Analyzes client and server bundle sizes |
| `npm run sync-template`| Fetches and merges upstream updates from template repo |

---

## 📁 Project Directory Structure

```text
├── actions/             # Next.js Server Actions (users, sessions, admin)
├── app/
│   ├── (app)/           # Protected routes (dashboard, settings, admin)
│   │   ├── admin/       # Admin panel (user management, roles, status)
│   │   ├── dashboard/   # Main user dashboard
│   │   └── settings/    # Profile, security, passkeys, sessions, danger zone
│   ├── (auth)/          # Authentication routes (login, signup, reset, 2fa, setup)
│   ├── (error)/         # Status pages (pending-approval, suspended, banned)
│   ├── api/             # API route handlers (Better Auth handler, health check)
│   └── globals.css      # Design system & Tailwind CSS configuration
├── components/          # Reusable UI & base components (buttons, dialogs, forms)
├── lib/
│   ├── auth/            # Better Auth client & server configurations, RBAC permissions
│   ├── prisma/          # Prisma database client singleton
│   ├── templates/       # HTML email notification templates
│   └── env.server.ts    # Type-safe environment validation
├── prisma/              # Prisma schema definition
├── public/              # Static assets (images, logos, icons, PWA manifest)
├── tanstacks/           # TanStack React Query mutations & query hooks
├── docker-compose.yml   # Multi-container Docker deployment
└── server.js            # Standalone production runner
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). You can also view the in-app [License Page](/license). Free to use for personal and commercial projects.

---

<div align="center">
  Built with ❤️ for modern full-stack developers.
</div>