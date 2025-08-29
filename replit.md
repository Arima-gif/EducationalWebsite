# Organization-Course-User Management System

## Overview

This is a comprehensive educational management platform that enables administration of organizations, users, courses, and student enrollments. The system provides a multi-tenant architecture where organizations can manage their own courses, instructors, and students through a centralized administrative interface. Built as a full-stack web application, it features a React frontend with a modern UI design system and an Express.js backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessibility and customization
- **Styling**: Tailwind CSS with CSS variables for theming support (light/dark modes)
- **State Management**: React Context API for client-side data management with custom DataProvider
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API structure with `/api` prefix routing
- **Development Server**: Vite integration for hot module replacement and fast development
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Data Storage Architecture
- **Database**: PostgreSQL with connection pooling via Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Design**: 
  - Organizations table with manager relationships
  - Users table with role-based access (admin, manager, instructor, support, student)
  - Courses table linked to organizations and instructors
  - Enrollments table for many-to-many student-course relationships
- **Data Validation**: Zod schemas for runtime type checking and API validation
- **Migrations**: Drizzle Kit for database schema management

### Authentication & Authorization
- **Session Management**: Express sessions with PostgreSQL session storage
- **Role-Based Access**: Five-tier user roles (admin, manager, instructor, support, student)
- **Organization Isolation**: Data scoping based on organization membership

### Component Architecture
- **Layout Components**: Sidebar navigation with section-based routing
- **Feature Components**: Dedicated modules for organizations, users, courses, and enrollments
- **Form Components**: Reusable dialog-based forms with validation
- **UI Components**: Comprehensive design system with consistent theming
- **Data Tables**: Sortable, filterable tables with action buttons and confirmation dialogs

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver for database connectivity
- **drizzle-orm & drizzle-kit**: Modern TypeSQL ORM with migrations
- **express**: Web application framework for Node.js
- **react & react-dom**: Frontend framework and DOM renderer
- **vite**: Build tool and development server

### UI and Styling Dependencies
- **@radix-ui/react-***: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library for consistent iconography

### Development and Tooling Dependencies
- **typescript**: Static type checking
- **@tanstack/react-query**: Server state management
- **react-hook-form & @hookform/resolvers**: Form handling with validation
- **zod**: Runtime type validation and schema definition
- **wouter**: Lightweight router for React applications

### Build and Deployment Dependencies
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution for development
- **connect-pg-simple**: PostgreSQL session store for Express