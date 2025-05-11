# AI Coffee Discovery App

A React-based application that helps users find coffee products matching their preferences using AI.

## Features

- AI-powered coffee recommendation system
- Interactive user interface for natural language queries
- Admin dashboard for managing products and viewing analytics
- Merchant dashboard for adding and managing coffee listings
- Integration with Supabase for backend services

## Project Structure

- `/src` - Source code
  - `/components` - Reusable UI components
  - `/pages` - Application pages/routes
  - `/services` - Service layers (AI, search, authentication)
  - `/contexts` - React context providers
  - `/assets` - Static assets (images, icons)
  - `/styles` - CSS and styling files
  - `/utils` - Utility functions
  - `/hooks` - Custom React hooks
  - `/api` - API client and integration code

## Tech Stack

- Frontend: React
- Backend: Supabase (PostgreSQL, Auth, Storage)
- AI Integration: OpenAI GPT or similar LLM
- Styling: CSS/SCSS (with possible UI framework)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```
