# PropClue - Dubai Real Estate Valuation Tool

## Overview

PropClue is a comprehensive Dubai real estate valuation and insights platform that provides:
- AI-powered property valuations with confidence scores
- Future value predictions (12, 24, 36 months)
- Y-o-Y (Year-over-Year) and Q-o-Q (Quarter-over-Quarter) growth metrics
- Area heatmaps showing demand intensity across Dubai neighborhoods
- Historical price trends and market analysis

## Brand Identity

- **Business Name**: PropClue
- **Primary Color**: #10857D (Teal)
- **Secondary Color**: #F8F6F2 (Cream/Off-white)
- **Font**: Plus Jakarta Sans

## Project Architecture

### Frontend (client/src)
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS with Shadcn UI components
- **Charts**: Recharts

### Backend (server)
- **Framework**: Express.js
- **Storage**: In-memory (MemStorage)
- **Validation**: Zod schemas

### Shared (shared)
- **Schema**: TypeScript types and Zod validation schemas

## Pages

1. **Dashboard** (`/`) - Market overview with stats, trends, and featured properties
2. **Properties** (`/properties`) - Browsable property listings with filters
3. **Heatmap** (`/heatmap`) - Area demand visualization and comparisons
4. **Valuation** (`/valuation`) - Property valuation calculator
5. **Property Detail** (`/property/:id`) - Individual property view with history

## API Endpoints

- `GET /api/properties` - List all properties
- `GET /api/properties/:id` - Get single property
- `GET /api/properties/similar/:id` - Get similar properties
- `GET /api/properties/:id/history` - Get price history
- `GET /api/areas/stats` - Get area statistics
- `GET /api/market/overview` - Get market overview
- `GET /api/market/trends` - Get market price trends
- `POST /api/valuation` - Calculate property valuation

## Recent Changes

- December 2024: Initial MVP with all core features
- PropClue brand colors and typography applied
- Dashboard with Y-o-Y and Q-o-Q growth indicators
- Future value prediction charts
- Area heatmap with demand intensity
- Property valuation tool

## User Preferences

- Focus on Dubai real estate market
- PropClue branding with teal (#10857D) primary color
- Plus Jakarta Sans font family
- Light/dark theme support
