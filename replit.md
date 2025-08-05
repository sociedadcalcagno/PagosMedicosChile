# Medical Payment Portal - Replit Guide

## Overview

This is a comprehensive medical payment portal web application built to manage doctor fee calculations and payment processing. The system serves as a "Maestros" (Masters) module for managing users, doctors, medical services, and calculation rules within healthcare institutions. It features a modern React frontend with a Node.js/Express backend, PostgreSQL database with Drizzle ORM, and includes an AI assistant for user support.

The application is designed to handle complex medical payment scenarios including different participation types (individual doctors vs medical societies), specialty-based calculations, and flexible rule engines for fee computation. It supports multi-institutional configurations and provides comprehensive reporting capabilities.

## Recent Changes

**August 5, 2025**
- Fixed all major application errors and import issues
- Successfully implemented "Agente HonorariosMedicos" AI assistant with OpenAI integration
- Resolved data handling issues across all frontend components
- Fixed array access and undefined data handling for doctors, services, rules, and users
- Application is now running successfully on port 5000 with authentication
- Database schema pushed and connected properly
- All core functionality is operational: authentication, AI chat, master data management
- **LATEST**: Fixed foreign key constraint violations in doctor editing (Individual vs Society types)
- **LATEST**: Corrected AI chat OpenAI API integration with proper JSON format requirements
- **LATEST**: Enhanced doctor form with medical society dropdown selector
- **LATEST**: Cleaned up database records and implemented robust validation for society references

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom medical-themed color palette
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Session-based authentication with Replit Auth integration

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with consistent error handling
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: OpenID Connect integration with Replit Auth
- **File Structure**: Modular separation of routes, storage, and database layers

### Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Comprehensive medical domain model including:
  - User management with role-based access (user, supervisor, admin)
  - Doctor profiles with specialty assignments and society relationships
  - Medical services/procedures with participation type classifications
  - Calculation rules with complex criteria and validity periods
  - Medical centers, insurance types, and agreement management
- **Migrations**: Drizzle Kit for schema management and migrations

### Key Domain Entities
- **Users**: Authentication and role management
- **Doctors**: Professional profiles with RUT identification, specialties, and payment configurations
- **Medical Services**: Procedure catalog with participation types and specialty associations
- **Calculation Rules**: Complex rule engine supporting percentage-based and fixed-amount calculations with criteria filters
- **Medical Societies**: Organization management for group practices
- **Medical Centers**: Multi-institutional support with customizable branding

### Authentication & Authorization
- **Strategy**: Session-based authentication using OpenID Connect
- **Provider**: Replit Auth integration for development environment
- **Session Storage**: PostgreSQL-backed session store for persistence
- **Security**: HTTP-only cookies with secure flag in production

### AI Integration
- **Provider**: OpenAI GPT-4o integration
- **Purpose**: Specialized medical payment assistant for user support
- **Features**: Context-aware responses about calculation rules, payment processes, and system guidance
- **Implementation**: Custom agent with domain-specific system prompts

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library for React
- **react-hook-form**: Form handling with validation
- **@hookform/resolvers**: Zod integration for form validation

### UI Component Libraries
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **shadcn/ui**: Pre-built component library based on Radix UI
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library for consistent iconography

### Database & Backend
- **drizzle-orm**: Type-safe ORM for PostgreSQL
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **express**: Web application framework
- **express-session**: Session middleware
- **connect-pg-simple**: PostgreSQL session store

### Authentication
- **openid-client**: OpenID Connect authentication
- **passport**: Authentication middleware

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety across the application
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundler for production builds

### AI Integration
- **openai**: Official OpenAI client library for GPT integration

### Validation & Utilities
- **zod**: Runtime type validation
- **drizzle-zod**: Integration between Drizzle and Zod
- **date-fns**: Date manipulation utilities
- **memoizee**: Function memoization for performance