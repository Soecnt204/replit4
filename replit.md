# HZ Shop Management

## Overview

HZ Shop Management is a modern retail management solution built with Next.js and React. The application provides comprehensive shop management capabilities including product inventory, sales receipts, customer management, and reporting. It features offline-first functionality using IndexedDB for local storage and automatic synchronization with Supabase when connectivity is restored. The system is designed as a Progressive Web App (PWA) with mobile-responsive design and supports both light and dark themes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js with React Server Components (RSC) and TypeScript
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React hooks and context for local state management
- **Routing**: Next.js App Router for file-based routing

### Component Structure
- **Layout Components**: Header, sidebar, bottom navigation, and floating action buttons
- **Page Components**: Dashboard, products, categories, receipts, returns, shopkeepers, reports, settings, and public catalog
- **Modal Components**: Add/edit product, create receipt, return management, and detail views
- **UI Components**: Comprehensive set of reusable components from Shadcn/ui

### Data Storage Solutions
- **Primary Database**: Supabase (PostgreSQL) for server-side data persistence
- **Offline Storage**: IndexedDB via custom offline-storage wrapper for local data caching
- **Sync Management**: Custom sync manager handling bidirectional data synchronization between local and remote storage

### Authentication and Authorization
- **Authentication Provider**: Supabase Auth with middleware-based session management
- **Session Handling**: Server-side session refresh and cookie management via middleware
- **Access Control**: Route-based protection and user session validation

### Offline-First Capabilities
- **Local Storage**: IndexedDB stores for products, categories, receipts, returns, shopkeepers, and sync queues
- **Sync Queue**: Queued operations for offline actions that sync when connectivity returns
- **Connection Monitoring**: Real-time online/offline status detection with automatic sync triggers
- **Data Consistency**: Conflict resolution and incremental sync mechanisms

### Progressive Web App Features
- **PWA Manifest**: Complete manifest.json with app metadata and icons
- **Install Prompt**: Custom installation prompt component for mobile and desktop
- **Service Worker**: Offline caching and background sync capabilities
- **Mobile Optimization**: Responsive design with mobile-first approach

### Business Logic Components
- **Product Management**: Full CRUD operations with categorization, stock tracking, and pricing
- **Receipt System**: Sales transaction processing with item tracking and payment handling
- **Return Management**: Return request processing with approval workflows
- **Shopkeeper Management**: Customer account management with credit tracking and payment history
- **Reporting**: Sales analytics, inventory reports, and business metrics dashboard

## External Dependencies

### Backend Services
- **Supabase**: Primary backend-as-a-service providing PostgreSQL database, authentication, and real-time subscriptions
- **Supabase Auth**: User authentication and session management
- **Supabase Storage**: File storage for product images and documents

### Frontend Libraries
- **Radix UI**: Accessible component primitives for complex UI components
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form handling with validation (@hookform/resolvers)
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Class Variance Authority**: Type-safe variant handling for component styling
- **CLSX**: Conditional className utility for dynamic styling

### Development Tools
- **TypeScript**: Static type checking and enhanced developer experience
- **Next.js**: React framework with server-side rendering and API routes
- **Geist Font**: Typography system for consistent text rendering
- **Vercel Analytics**: Performance monitoring and user analytics

### PDF Generation
- **jsPDF**: Client-side PDF generation for receipts and reports

### Data Management
- **Date-fns**: Date manipulation and formatting utilities
- **IndexedDB**: Browser-native database for offline storage
- **Custom Sync Manager**: Bidirectional data synchronization between local and remote storage

### UI Enhancement
- **Embla Carousel**: Touch-friendly carousel component for image galleries
- **CMDK**: Command palette component for quick actions
- **Vaul**: Drawer component for mobile interactions
- **Next Themes**: Theme switching with system preference detection