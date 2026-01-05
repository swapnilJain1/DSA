# DSA Master

A modern, glassmorphism-styled Data Structures and Algorithms (DSA) tracker with AI-powered insights, progress analytics, and distraction-free practice tools.

![DSA Master Screenshot](https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2070&auto=format&fit=crop)

## ✨ Features

- **Dashboard**: Track solved problems, weekly goals, and current streaks.
- **AI Integration**: 
  - **Smart URL Fetching**: Auto-detect problem titles from URLs.
  - **AI Hints**: Get cryptic nudges without revealing the full solution.
  - **Complexity Analysis**: Auto-analyze time and space complexity of your code.
  - **Chat Assistant**: Ask "AlgoMind" specific questions about your code context.
- **Analytics**: 
  - Visual Breakdown of difficulty (Easy/Medium/Hard).
  - Activity Heatmaps (GitHub style).
  - Efficiency grading (Elite, High, Avg, Low) based on time taken.
- **Focus Timer**: Built-in timer with Picture-in-Picture mode support.
- **Privacy First**: "Bring Your Own Key" (BYOK) architecture. Your Gemini API key is stored locally in your browser and never sent to our servers.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (`@google/genai`)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key (Get one [here](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/swapnilJain1/dsa-app.git
   cd dsa-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

5. Go to **Settings** in the app sidebar and enter your Gemini API Key.

## 🧪 Running Tests

This project uses Vitest for unit testing.

```bash
npm run test
```

## 📦 Deployment

To build the app for production:

```bash
npm run build
```

The output will be in the `dist` folder, which can be deployed to any static host (Vercel, Netlify, GitHub Pages).

## 📄 License

MIT
