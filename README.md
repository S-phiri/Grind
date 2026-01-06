# Grind — Football Performance Training Platform

A premium, mobile-first web platform for elite football performance training combining a public marketing site with an authenticated training app.

## Features

### Marketing Site (Public)
- **Hero Section**: Full-width cinematic training imagery with dual CTAs
- **How It Works**: Four-step horizontal card flow explaining the training process
- **Programmes Grid**: Glassy cards showcasing training types with intensity tags
- **Social Proof**: Testimonial carousel with player avatars and quotes
- **Pricing Tiers**: Three-column comparison table with feature checkmarks
- **Footer**: Multi-column layout with newsletter signup

### Training App (Authenticated)
- **Dashboard**: Weekly training calendar, progress rings, upcoming sessions, streak counter
- **Session Detail**: Exercise list with sets/reps/tempo, video thumbnails, timer interface
- **Progress Tracker**: Line charts for strength/speed metrics, body composition trends
- **Profile**: User stats, training history, achievement badges, settings
- **Bottom Navigation**: Five-tab mobile nav for easy navigation

## Design System

### Colors
- **Charcoal Base**: `#0F1419` - Deep charcoal with subtle dark blue tint
- **Panel**: `#1A1F26` at 70% opacity with 20px backdrop blur
- **Electric Green**: `#00FF88` - Primary actions and progress indicators
- **Warm Orange**: `#FF6B35` - Intensity tags and secondary highlights

### Typography
- **Display/Headings**: `Syne` (Extra Bold, 800) - Athletic energy
- **Body/UI Text**: `Manrope` (Medium 500, SemiBold 600) - Clean and readable
- **Data/Metrics**: `JetBrains Mono` (Medium 500) - Data-driven aesthetic

### Key Design Features
- Glassmorphism panels with frosted glass effect
- Subtle noise texture overlay (5% opacity)
- Custom glow effects for interactive elements
- Smooth transitions with cubic-bezier easing (0.4, 0.0, 0.2, 1)

## Routes

- `/` - Marketing site homepage
- `/login` - Authentication page
- `/app` - Main dashboard (authenticated)
- `/app/session/:id` - Session detail view

## Tech Stack

- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS with custom utilities
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router v6

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Design Principles

Every element should feel like it belongs in a high-performance training facility — clinical, precise, and built for serious athletes. The platform avoids playful or casual design choices, focusing on calculated improvement through data-driven training.

