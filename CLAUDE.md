# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build to /dist
npm run preview      # Preview production build
```

**Environment Setup:** Create `.env.local` with `GEMINI_API_KEY=your-key`

No test framework or linting is currently configured.

## Architecture Overview

This is a React 19 SPA for an educational platform targeting Egypt and GCC countries. There is no backend - the app calls Google Gemini API directly from the browser.

### Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS (loaded via CDN in index.html)
- Google Generative AI SDK (@google/genai) with Gemini 3 Flash model

### Key Patterns

**Internationalization:** Manual i18n via `translations.ts` with English/Arabic support. The `LanguageContext` provider manages language state and automatically switches document direction (RTL for Arabic) via `document.documentElement.dir`.

**AI Integration:** `services/geminiService.ts` handles all Gemini API calls. The AI assistant receives course context and system instructions to respond in the user's selected language.

**State Management:** React Context for language/translations; local `useState` for UI state like the registration modal.

### Component Structure
- `App.tsx` - Main layout assembling all page sections
- `components/LanguageContext.tsx` - i18n context provider with RTL support
- `components/AIAssistant.tsx` - Floating chat widget using Gemini
- `components/CourseList.tsx` - Course catalog with category filtering
- `services/geminiService.ts` - Gemini API wrapper with system prompts

### Type Definitions
Core types in `types.ts`: `Course`, `Instructor`, `Testimonial`, `ChatMessage`. Static data (courses, instructors, partners) lives in `constants.ts`.

## Path Aliases

`@` maps to the project root (configured in both `tsconfig.json` and `vite.config.ts`).
