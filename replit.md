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
- **LATEST**: Implemented mock authentication system to bypass Replit Auth limitations in development
- **LATEST**: Added 3 test users (Admin, Supervisor, User) for comprehensive multi-role testing
- **LATEST**: Disabled Replit Auth in development environment to prevent authentication conflicts
- **LATEST**: Implemented professional login page with medical theme matching user requirements
- **LATEST**: Created role-based routing system with different interfaces for different user profiles
- **LATEST**: Built dedicated doctor dashboard for regular users with limited access to relevant modules
- **LATEST**: Restructured navigation to show master data management only to admin/supervisor roles
- **LATEST**: Integrated multi-clinic/multi-enterprise architecture considerations in user interface
- **LATEST**: Refined permission system: Admins get full access, Supervisors manage maintenance modules but not users, Doctors get personal dashboard only
- **LATEST**: Fixed society medical selector in calculation rules - replaced manual RUT/name inputs with dropdown list of registered medical societies
- **LATEST**: Corrected main content layout centering issue - content was shifted right, now properly centered in available space
- **LATEST**: Fixed responsive layout spacing issues - reduced sidebar width to 180px and adjusted main content margin to eliminate excessive white space between menu and content
- **LATEST**: Implemented comprehensive payment system database schema with official Chilean healthcare provider types (FONASA A/B/C/D, ISAPREs, Particular)
- **LATEST**: Added complete payment workflow tables: provider_types, service_tariffs, medical_attentions, payment_calculations, and payments
- **LATEST**: Created sample data for FONASA tramos, ISAPREs, and service tariffs with realistic Chilean medical pricing
- **LATEST**: Established foundation for calculating doctor payments based on participation rules and provider types
- **LATEST**: Built complete payment processing frontend with three dedicated pages: Medical Attentions, Calculate Payments, and Process Payments
- **LATEST**: Implemented backend APIs for full payment workflow including attention recording, payment calculations, and payment processing
- **LATEST**: Added sample medical attention data with correct provider type foreign keys for testing complete payment flow
- **LATEST**: Updated navigation system with new "Sistema de Pagos" section showing all payment-related modules to admin users
- **LATEST**: Successfully implemented advanced data import system with CSV upload, API integration, and HIS connectivity
- **LATEST**: Created comprehensive CsvUploader component with progress tracking, error handling, and multi-source import capabilities
- **LATEST**: Tested CSV import functionality - successfully imported 2 new attentions from CSV data (88776655-4 Roberto Silva, 77665544-3 Elena Torres)
- **LATEST**: Built server endpoints for /api/import/csv-attentions, /api/import/api-attentions, and /api/import/his-attentions with proper data validation
- **LATEST**: Implemented differentiated import types for Chilean medical system: "Registros Participaciones" (TMP_REGISTROS_PARTICIPACION) and "Registros HMQ" (TMP_REGISTROS_HMQ)
- **LATEST**: Created specific endpoints for each record type: csv-participacion/csv-hmq, api-participacion/api-hmq, his-participacion/his-hmq with proper field mapping
- **LATEST**: Added radio button selector in import interface with user-friendly labels: "Registros Participaciones" and "Registros HMQ" instead of technical database names
- **LATEST**: Resolved critical foreign key constraint violations in CSV import system by implementing auto-creation of missing doctors and services
- **LATEST**: Built intelligent data mapping system that finds existing records by internal codes or creates new ones automatically during import
- **LATEST**: Successfully tested complete CSV import workflow - system now handles TMP_REGISTROS_PARTICIPACION with all medical professional and society fields
- **LATEST**: Implemented robust error handling and data validation for Chilean medical system compliance with automatic entity resolution
- **LATEST**: Fixed critical apiRequest parameter order bug across all application files causing fetch failures throughout the system
- **LATEST**: Resolved foreign key constraint violation in calculation rules editing by implementing proper null handling for empty foreign key fields
- **LATEST**: Enhanced error handling with detailed logging and validation feedback for better debugging and user experience
- **LATEST**: Completely redesigned PDF system with professional medical styling featuring modern typography, gradients, and responsive design
- **LATEST**: Implemented intelligent PDF content display - only shows relevant sections (Participaciones/HMQ) based on actual data availability
- **LATEST**: Fixed PDF title logic to dynamically adjust based on liquidation type (Participaciones only, HMQ only, or both)
- **LATEST**: Resolved PDF data display issues by implementing proper backend data retrieval for detailed attention records
- **LATEST**: Added temporary mock data system for PDF testing while resolving Drizzle ORM compatibility issues
- **LATEST**: Fixed critical PDF format issue - now generates real PDF files using Puppeteer instead of HTML downloads
- **LATEST**: Implemented proper PDF binary generation with correct MIME type (application/pdf) and file extensions (.pdf)
- **LATEST**: Successfully tested PDF download functionality - system now produces authentic PDF documents with professional medical styling
- **LATEST**: Completely redesigned doctor dashboard with premium visual design featuring gradient cards, professional medical styling, and enhanced user experience
- **LATEST**: Resolved TypeScript errors in doctor dashboard that prevented reports functionality from working properly
- **LATEST**: Enhanced reports section with three distinct report types: Cartola PDF generation, payment analysis, and medical history export
- **LATEST**: Implemented professional welcome header with gradient backgrounds, specialty information, and medical-themed iconography
- **LATEST**: Added hover effects, animations, and premium card designs with realistic Chilean medical payment amounts for presentation quality
- **LATEST**: Fixed PayloadTooLargeError in CSV imports by increasing Express.js file size limit from default 100kb to 50MB
- **LATEST**: Implemented comprehensive CSV import limits system with 10,000 records per file maximum and intelligent error handling
- **LATEST**: Added /api/import/limits endpoint providing detailed information about import constraints, processing times, and best practices
- **LATEST**: Enhanced all CSV import endpoints (participacion, hmq, attentions) with consistent record limit validation and user-friendly error messages

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