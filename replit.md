# Wizard Flix - Anime Streaming Platform

## Overview

Wizard Flix is a magical-themed anime streaming platform built with React and Express. It allows users to browse trending anime content, search for specific titles, view details, and maintain a personal "Grimoire" (favorites list). The application integrates with TMDB (The Movie Database) API for content data and uses an embedded player for streaming.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: Framer Motion for UI transitions
- **Build Tool**: Vite

The frontend follows a page-based structure with reusable components. Key pages include Home (trending content with hero carousel + "Novidades" horizontal section), Search, Details, Watch (embedded player), Grimoire (favorites), and Genres.

### Navigation
- **Desktop**: Header navigation with buttons (Início, Catálogo, Favoritos)
- **Mobile**: Side drawer menu accessed via hamburger button in header

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **API Design**: RESTful endpoints prefixed with `/api`
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: Express sessions (configured for pg-simple)

The server handles authentication, favorites management, and proxies requests to the TMDB API. Routes are defined in `server/routes.ts` with type-safe schemas in `shared/routes.ts`.

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle table definitions and Zod validation schemas
- `routes.ts`: API route definitions with input/output schemas

### Database Schema
Two main tables:
- **users**: id, username, password, avatarUrl, nameColor (RGB color for animated header text), createdAt
- **favorites**: id, userId, tmdbId, type (movie/tv), title, posterPath, addedAt

### Fandub System
The application supports fan-dubbed content (Fandub) with custom embed URLs:
- **Data Storage**: `fandub.json` file in root directory
- **Routes**: `/details/fandub/:id` and `/watch/fandub/:id/:season/:episode` for fandub-specific content
- **API Endpoints**: 
  - `GET /api/fandub` (list all)
  - `GET /api/fandub/:id` (details with TMDB data merged, includes `tmdbSeasons` for poster images)
  - `GET /api/fandub/:id/episode?season=X&episode=Y` (get specific episode embed URL)
- **Structure**: Each fandub entry contains:
  - `id`: TMDB ID of the anime
  - `type`: "tv" or "movie"
  - `title`: Display title
  - `embedUrl`: Custom player embed URL (for movies or single-episode content)
  - `seasons`: Object with season/episode structure and embed URLs (for TV shows)
    - Example: `{ "1": { "1": "https://drive.google.com/...", "2": "..." }, "2": { "1": "..." } }`
  - `studio`: Object with `name` and `socialLink` for the dubbing studio
  - `cast`: Array of `{ character, voiceActor, characterImage }` for voice actors
- **Embed URL Support**: Automatically formats Google Drive and YouTube links for embedding
- **Genre Filter**: "Fandub" appears as a genre option in `/genres` page
- **UI Features**: 
  - Fandub badge on posters and details page
  - Season cards with TMDB poster images showing only available dubbed seasons
  - Episode navigation in watch page based on fandub configuration
  - Cast section with character avatars and voice actor names
  - Studio button with auto-detected social media icon (Instagram, YouTube, Twitter/X, TikTok, Discord, Twitch, Facebook)

### Social Media Detection
Located in `client/src/lib/socialMedia.ts`:
- Automatically detects platform from URL patterns
- Returns appropriate icon component and brand color
- Supports: Instagram, YouTube, Twitter/X, TikTok, Facebook, Discord, Twitch, and generic website fallback

### Authentication Flow
Simple username/password authentication with session-based auth. No external OAuth providers. Passwords should be hashed before storage (implementation detail in routes).

### Design Theme
The application uses a dark, magical RPG theme with:
- Purple primary color (#8B5CF6)
- Black background with gradient overlays
- Custom fonts: MedievalSharp for headings, DM Sans for body text
- Glow effects and smooth animations

## External Dependencies

### Third-Party APIs
- **TMDB API**: The Movie Database API for all content data (trending, search, details). Requires `TMDB_API_KEY` environment variable. Responses are in Portuguese (pt-BR).

### Embedded Player
- **PlayerFlixAPI**: External streaming service used via iframe embeds at `playerflixapi.com` for movie and TV episode playback.

### Database
- **PostgreSQL**: Required for user data and favorites. Connection via `DATABASE_URL` environment variable.

### Key NPM Packages
- `drizzle-orm` + `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Server state management
- `framer-motion`: Animation library
- `wouter`: Client-side routing
- `zod`: Schema validation
- `shadcn/ui` components via Radix primitives