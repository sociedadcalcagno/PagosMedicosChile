# Medical Payment Portal - Replit Guide

## Overview
This project is a comprehensive web application designed to manage doctor fee calculations and payment processing within healthcare institutions. It functions as a "Maestros" module, overseeing users, doctors, medical services, and calculation rules. The application aims to streamline complex medical payment scenarios, including various participation types and specialty-based calculations, through a flexible rule engine. It supports multi-institutional configurations, offers robust reporting, and integrates an AI assistant for user support. The vision is to provide a robust, scalable solution for healthcare financial management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript (Vite)
- **UI Components**: shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS (medical-themed palette)
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Session-based with Replit Auth integration
- **UI/UX Decisions**: Professional login page with medical theme, role-based routing, dedicated doctor dashboard, restructured navigation based on roles, multi-clinic/multi-enterprise architecture considerations, gradient cards, professional medical styling, hover effects, and animations.
- **Responsive Layout**: Optimized spacing with reduced sidebar width and properly centered content.
- **PDF System**: Redesigned with professional medical styling, dynamic content display, and authentic PDF generation via Puppeteer.
- **Data Import**: Advanced system with CSV upload, API integration, and HIS connectivity, intelligent data mapping, and robust error handling.
- **Filtering & Search**: Enhanced medical attentions filter and intelligent doctor search with real-time filtering and pagination.

### Backend Architecture
- **Runtime**: Node.js with Express.js (TypeScript, ES modules)
- **API Design**: RESTful, consistent error handling
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: OpenID Connect integration with Replit Auth
- **File Structure**: Modular (routes, storage, database)
- **Technical Implementations**: Increased Express.js file size limit for CSV imports, comprehensive CSV import limits system.

### Database Design
- **Database**: PostgreSQL (Neon serverless hosting)
- **ORM**: Drizzle ORM
- **Schema**: Comprehensive medical domain model including users (role-based), doctors (RUT, specialties, payment configs), medical services (participation types, specialties), calculation rules (complex criteria), medical societies, medical centers, insurance types, and agreement management.
- **Payment System**: Comprehensive database schema for official Chilean healthcare provider types (FONASA, ISAPREs, Particular), service tariffs, medical attentions, payment calculations, and payments.
- **Migrations**: Drizzle Kit

### AI Integration
- **Provider**: OpenAI GPT-4o
- **Purpose**: Specialized medical payment assistant
- **Features**: Context-aware responses for rules, payment processes, system guidance.
- **Implementation**: Custom agent with domain-specific prompts.

## External Dependencies

### Core Framework Dependencies
- `@tanstack/react-query`
- `wouter`
- `react-hook-form`
- `@hookform/resolvers`

### UI Component Libraries
- `@radix-ui/*`
- `shadcn/ui`
- `tailwindcss`
- `lucide-react`

### Database & Backend
- `drizzle-orm`
- `@neondatabase/serverless`
- `express`
- `express-session`
- `connect-pg-simple`

### Authentication
- `openid-client`
- `passport`

### Development Tools
- `vite`
- `typescript`
- `tsx`
- `esbuild`

### AI Integration
- `openai`

### Validation & Utilities
- `zod`
- `drizzle-zod`
- `date-fns`
- `memoizee`

## Recent Technical Improvements
- **LATEST**: Created comprehensive data cleanup system with patient-specific deletion and total system reset capabilities for efficient data management and reprocessing workflows
- **LATEST**: Successfully resolved numeric overflow errors by expanding decimal precision from 10,2 to 15,2 to handle large Chilean peso amounts (millions)
- **LATEST**: Implemented robust data cleaning function that converts problematic values like "14366756-1" to valid numbers "143667561" during Excel/CSV imports
- **LATEST**: Added three-tier cleanup interface: delete unprocessed records, delete specific patient records, and complete system reset with confirmation
- **LATEST**: Increased import processing capacity from 100 to 500 records per batch for improved efficiency in handling large medical datasets
- **LATEST**: Enhanced Excel date conversion system to properly handle serial number dates (45877 format) commonly exported from Oracle/PL-SQL Developer
- **LATEST**: Completed comprehensive system cleanup by removing Oracle direct connection complexity and streamlining data transfer processes for better maintainability and cost efficiency
- **LATEST**: Simplified import interface to focus on reliable file-based transfers (Excel/CSV) eliminating network connectivity challenges with private Oracle databases
- **LATEST**: Fixed all TypeScript errors and code inconsistencies, resulting in a clean, stable codebase optimized for medical data import workflows
- **LATEST**: Maintained intelligent error interpretation system that converts technical database and import errors into clear operational messages with specific solutions for non-technical users
- **LATEST**: Preserved automatic specialty detection and creation system that properly maps specialty names to database IDs during CSV/Excel imports
- **LATEST**: Kept enhanced import result display with professional error categorization, detailed solutions, and collapsible technical details for debugging
- **LATEST**: Continued intelligent CSV separator auto-detection system that automatically identifies correct delimiters, solving import issues caused by incorrect separators
- **LATEST**: Maintained comprehensive Excel (.xlsx/.xls) file import support, eliminating data corruption issues from commas in medical descriptions
- **Data Import**: Streamlined system with CSV upload, Excel support, API integration, and HIS connectivity, focusing on reliable file-based transfers with intelligent data mapping and robust error handling.