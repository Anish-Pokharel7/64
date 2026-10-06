# 64 Delivery

A production-ready food delivery mobile application built for Itahari, Nepal.

## Project Overview

64 Delivery is a food delivery app that connects customers with their favorite local restaurants. Phase 1 establishes the foundation — UI, navigation, architecture, and state management — using mock data, ready for a real backend in future phases.

## Technology Stack

- React Native + Expo (SDK 54)
- Expo Router (file-based navigation)
- TypeScript
- TanStack Query (server-style data)
- Zustand (client-side state)
- React Hook Form + Zod (forms & validation)
- Expo SecureStore (token storage)
- Expo Image (optimized images)
- Lucide React Native (icons)

## Features (Phase 1)

- Splash screen with brand identity
- Welcome screen
- Authentication UI (Login, Register, Forgot Password)
- Customer navigation (Home, Search, Orders, Profile tabs)
- Home screen with categories, promo banner, popular restaurants, recommended food
- Search screen with category filters and live search
- Restaurant details with menu sections
- Food details with quantity selector
- Cart with add/remove/quantity controls and totals
- Orders screen with active/past tabs
- Profile screen with menu and logout
- Saved addresses list and add address form
- Loading, error, and empty states throughout
- Centralized theme system (colors, typography, spacing, radius, shadows)
- Full API architecture (client, endpoints, services, hooks)
- Mock data with realistic Nepal-focused restaurants and food

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

## Running the App

```bash
npx expo start
```

Press `w` for web, or scan the QR code with the Expo Go app on Android.

## Project Structure

```
app/                    # Expo Router screens
  (auth)/               # Authentication flow
  (customer)/           # Customer app
    (tabs)/             # Bottom tab navigation
    restaurant/[id]     # Restaurant details
    food/[id]           # Food details
    cart                # Shopping cart
    addresses/          # Address management

src/
  components/           # Reusable UI & domain components
  api/                  # HTTP client & endpoints
  services/             # Business logic layer
  hooks/                # React Query hooks
  store/                # Zustand stores
  types/                # TypeScript models
  schemas/              # Zod validation schemas
  mock/                 # Mock data
  theme/                # Design system
  constants/            # App constants
  utils/                # Utility functions
  config/               # Environment & app config
  providers/            # React context providers
```

## Architecture

```
UI → Hooks → Services → API Client → Backend
```

Screens never access the API directly. Data flows through hooks → services → client.

## Development Rules

- No `any` types
- No hardcoded API URLs
- No passwords stored locally
- Centralized theme — no scattered colors
- Screens access data only through hooks

## Phase 1 Scope

Phase 1 builds the complete customer-facing foundation with mock data. Real backend, payments, live tracking, rider app, and admin dashboard are out of scope.

## Future Roadmap

- Phase 2: Real backend (Node.js + Express + MongoDB/PostgreSQL)
- Phase 3: Khalti / eSewa payment integration
- Phase 4: Real-time order tracking with GPS
- Phase 5: Restaurant & Rider apps
- Phase 6: Admin dashboard & analytics
- Phase 7: Push notifications, coupons, loyalty program
