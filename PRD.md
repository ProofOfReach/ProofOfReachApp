# Nostr Decentralized Ad Marketplace – Product Requirements Document (PRD)

**Version:** 1.3  
**Last Updated:** 2025-05-15  

---

## Overview

This document outlines the product requirements for a decentralized advertising marketplace built on top of the Nostr protocol, utilizing Bitcoin and Lightning Network for payment settlements. The product is envisioned to launch in phases, beginning with a minimal viable product (MVP) and evolving into a robust platform with a browser extension and eventually, open ad inventory APIs.

---

## Background

Nostr enables decentralized, censorship-resistant communication, while the Lightning Network enables microtransactions. This PRD defines how to bring those two together into an open advertising network, with incentives for both content creators and advertisers, and built-in resistance to spam, fraud, and rent-seeking middlemen.

---

## Problem Statement

Current digital ad systems are centralized and opaque. They extract large rents, limit transparency, and are poorly suited to micro-publishing platforms like Nostr. There’s no simple, open, native way for people to pay to boost content or sponsor creators directly.

---

## Objectives

- Launch a usable MVP for publishers and advertisers with built-in payment rails (Lightning).
- Enable Nostr-native "boosting" of content (e.g., notes or zaps) that is decentralized, transparent, and optionally reputation-based.
- Grow a network of pub/relays and client devs who opt-in to showing relevant paid messages.
- Maintain open APIs and optionally implement trust/reputation systems for spam resistance.

---

## Phase 1: MVP (Web App)

### Features
- **Ad Buyer Interface:**
  - Select post type (e.g., zap, note, or custom short text).
  - Targeting: Choose basic filters like topic tags (`#nostr`, `#bitcoin`, etc.).
  - Budget and duration setting.
  - Pay with Lightning (via LNURL, WebLN, or keysend).

- **Publisher Interface:**
  - Authenticate with Nostr key (NIP-07 or private key).
  - Register to accept paid ads.
  - View and approve/reject incoming ad offers.
  - Define minimum price for showing paid content (CPM, CPT, or flat per-post).

- **Ad Delivery:**
  - Use a centralized indexer (initially) to track paid messages.
  - Relays can optionally flag or prioritize paid content.

- **Admin/Analytics:**
  - Basic ad spend tracking per user.
  - Impression and click estimates (based on opt-in client tracking).

### Tech Stack
- **Frontend:** React (Next.js preferred)
  - **UI Components:** shadcn/ui component library for modern, accessible, and consistent design
  - **Design System:** Tailwind CSS for utility-first styling and theme customization
  - **Component Patterns:** Follow shadcn/ui best practices for modular, reusable components
  - **Data Visualization:** StandardizedDataTable component with search, sort, and filter capabilities for consistent data presentation
  - **User Access Management:** Role-based access control system with separate test mode for UI visibility
- **Backend:** Node.js or Go (simple REST API with WebSocket for real-time zap confirmations)
- **Database:** SQLite with Prisma ORM for development and testing
  - **IMPORTANT:** Development and testing MUST use SQLite only; PostgreSQL migration is planned for future production deployment but NOT to be used until formal migration
  - **Role Management:** Flexible UserRole table structure with role transitions and fallback mechanisms
- **Lightning:** LNbits, LND, or OpenNode (abstracted via WebLN)
- **Nostr Integration:** nostr-tools for key management and event publishing

---

## Phase 2: Browser Extension

- Allows seamless content promotion while browsing any Nostr client (e.g., snort.social).
- Adds a "Boost with sats" button next to each note.
- Allows publishers to monetize directly from their clients.

---

## Phase 3: Open Relay/Client APIs

- Expose APIs for relays to verify ad payment receipts.
- Allow relays to charge to propagate promoted messages.
- Create open-index marketplace for ad slots (tagged by topic, language, location).

---

## Monetization

- Take a small fee from ad transactions (e.g., 1–2%).
- Offer analytics dashboards as a paid premium service.
- Optionally, white-label infrastructure for publishers.

---

## Risks

- **Spam:** Need proof-of-payment or proof-of-human to limit abuse.
- **Sybil attacks:** Consider integrating reputation or stake-based models.
- **Lightning complexity:** Simplify with WebLN/Alby for browser users.
- **Nostr fragmentation:** Not all clients/relays may adopt promoted messages.

---

## Metrics of Success

- Daily ad campaigns launched.
- Average cost per action (zap, click, etc.).
- Number of registered publishers and advertisers.
- Nostr relays opting in to ad propagation.
- Volume of sats moved through the platform.

---

## Out of Scope (for MVP)

- AI-based targeting or optimization.
- Complex fraud detection.
- Mobile app.
- Multi-language UI (beyond English).
- Full relay-node decentralization (MVP can be semi-centralized).

---

## Changelog

- **v1.3** (2025-05-15): Added sophisticated role management system specifications, including the UserRole table structure and test mode for UI visibility.
- **v1.2** (2025-05-12): Added StandardizedDataTable component to the tech stack for consistent data visualization across the application.
- **v1.1** (2025-05-12): Added shadcn/ui component library requirements and specifications to the tech stack.
- **v1.0** (2025-05-08): Initial version with full context and scoped features for Phase 1 MVP, Phase 2 Extension, and Phase 3 APIs.

---

