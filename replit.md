# Beta BSS - Community Bulletin Board

## Overview

This is a non-Flask bulletin board web application built with React frontend and Express.js backend. The application allows users to register, authenticate, and share messages in a community setting. It features a role-based system with regular users and administrators, along with an activity badge system that rewards users based on their posting frequency. The application uses PostgreSQL for data persistence and implements secure authentication through Replit's OIDC system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with dark theme implementation
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Replit OIDC integration with Passport.js strategy
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API endpoints with proper HTTP status codes
- **Request Handling**: JSON and URL-encoded form data support
- **Error Handling**: Centralized error handling middleware

### Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Tables**: 
  - `users`: Core user information with role system (0=user, 1=admin)
  - `messages`: User posts with 500 character limit
  - `sessions`: Session storage for authentication (required for Replit Auth)
- **Relationships**: One-to-many between users and messages
- **Constraints**: Unique usernames, character limits, foreign key relationships

### Authentication & Authorization
- **Provider**: Replit OIDC (OpenID Connect) authentication
- **Session Storage**: PostgreSQL-backed sessions with 7-day TTL
- **Role System**: Integer-based roles (0=regular user, 1=administrator)
- **Route Protection**: Middleware-based authentication checks on API endpoints
- **Security**: HTTPS enforcement, secure cookies, session validation

### Badge System
- **Tiers**: Five activity levels based on post count
  - New Member (0-4 posts): Gray user icon
  - Active Member (5-9 posts): Blue thumbs-up icon  
  - Bronze Contributor (10-24 posts): Bronze star icon
  - Silver Contributor (25-49 posts): Silver award icon
  - Gold Contributor (50+ posts): Gold trophy icon
- **Implementation**: Client-side badge calculation with Font Awesome icons

### UI/UX Design
- **Theme**: Dark mode implementation with CSS custom properties
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Icons**: Font Awesome for consistent iconography
- **Notifications**: Toast notifications for user feedback
- **Accessibility**: Radix UI primitives provide built-in accessibility features

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL with Neon serverless driver
- **Authentication**: Replit OIDC service
- **Session Store**: PostgreSQL via connect-pg-simple

### Frontend Libraries
- **UI Framework**: React 18 with TypeScript
- **UI Components**: Radix UI primitives and shadcn/ui
- **Styling**: Tailwind CSS with PostCSS
- **State Management**: TanStack Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Date Utilities**: date-fns for timestamp formatting
- **Routing**: Wouter for lightweight client-side routing

### Backend Libraries
- **Web Framework**: Express.js with TypeScript
- **Database**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with OpenID Connect strategy
- **Security**: bcryptjs for password hashing
- **Session Management**: express-session with PostgreSQL store
- **Validation**: Zod for runtime type checking

### Development Tools
- **Build Tool**: Vite for frontend bundling
- **Bundler**: esbuild for backend production builds
- **TypeScript**: Full-stack type safety
- **Development Server**: Vite dev server with HMR
- **Database Migrations**: Drizzle Kit for schema management

### External Services
- **Hosting**: Replit platform integration
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit OIDC identity provider
- **CDN**: Font Awesome via CDN for icons
- **Fonts**: Google Fonts for typography