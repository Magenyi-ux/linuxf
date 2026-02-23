# West African Exam Prep AI (Offline-First)

This is a Progressive Web App (PWA) designed to help students prepare for JAMB, WAEC, and NECO exams. It features an **offline-first** architecture, allowing students to study even without an internet connection.

## Features

- **Offline Study**: Download question packs while online and study them anytime, anywhere.
- **AI Tutor**: Integrated AI tutor for explanations.
  - **Online**: Uses Google Gemini AI for advanced tutoring and search.
  - **Offline**: Falls back to a local `OfflineTutorService` that uses keyword matching against your downloaded materials.
- **Study Planner**: Organize your study schedule and track tasks directly on your device.
- **Progress Tracking**: Your scores, best attempts, and study history are saved locally in the browser.
- **Math Support**: High-quality LaTeX math rendering using KaTeX.
- **Offline Question Bank**: Includes a built-in library of 1,000 authentic past questions across core subjects.

## Tech Stack

- **Language**: TypeScript
- **Framework**: React (Vite)
- **Offline System**: PWA with Service Workers (Workbox)
- **Data Storage**: `localStorage` for persistent local data
- **AI**: Google Gemini AI (Online) & Custom Offline Logic

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

Set the `GEMINI_API_KEY` in your `.env` file to enable the AI Tutor online features:
```bash
GEMINI_API_KEY=your_api_key_here
```

### Running the App

Run the development server:
```bash
npm run dev
```

Build for production (this generates the PWA service worker):
```bash
npm run build
```

## How Offline-First Works

1.  **Asset Caching**: The app uses `vite-plugin-pwa` to cache all code and assets (including external fonts and styles from CDNs). Once visited, the app loads instantly without internet.
2.  **Data Persistence**: All exam packs you download are stored in `localStorage` under the key `waExamPrep_books`. Chat messages and study tasks are similarly persisted. The app comes pre-bundled with 1,000 questions (Mathematics, English, Chemistry, and Physics) to ensure immediate offline utility.
3.  **Offline AI fallback**: When the browser detects it's offline, the `ChatBot` component automatically switches to the `offlineTutor`, providing assistance based on your local library.

---
*Note: This project previously had Convex and Clerk integrations which have been disabled in favor of a pure offline-first experience using local storage and Gemini AI.*
