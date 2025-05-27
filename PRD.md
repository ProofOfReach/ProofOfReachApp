# Product Requirements Document (PRD)

## v1.0 (2025-01-27) — Initial Requirements

### Project Overview
ProofOfReach is a decentralized ad marketplace platform built on the Nostr protocol with Bitcoin Lightning Network integration. The platform enables transparent, efficient digital advertising through blockchain technologies.

### Core Features
- **Nostr Protocol Integration**: Decentralized identity and communication
- **Lightning Network Payments**: Bitcoin-based transactions for ads
- **Role-Based Access Control**: Viewer, Advertiser, Publisher, Admin, Stakeholder roles
- **Campaign Management**: Multi-step wizard for ad creation and targeting
- **Supabase Authentication**: Secure user authentication maintaining Nostr key-based identification
- **Real-time Analytics**: Campaign performance tracking and reporting

### Technical Requirements
- **Frontend**: Next.js 15.3.1 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth with Nostr key integration
- **Styling**: Tailwind CSS with Radix UI components
- **Testing**: Jest with React Testing Library

### User Interface Requirements
- Clean, minimal login page with ProofOfReach branding
- Single hackathon banner at page top (no duplicates)
- Compact login card design
- Consistent footer across all pages
- Role-specific dashboard interfaces