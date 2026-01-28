# Bug Reporting Website

A Next.js bug reporting website for employees to submit and track bugs.

## Tech Stack

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI:** React 18+

## Features

- ✅ Bug submission form with title, description, severity, and priority
- ✅ Bug list view with cards
- ✅ Status tracking (Open, In Progress, Resolved, Closed)
- ✅ Filtering by status and severity
- ✅ Delete functionality
- ✅ Modern responsive UI

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm (comes with Node.js)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles with Tailwind
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page component
├── components/
│   ├── BugCard.tsx      # Individual bug display card
│   ├── BugForm.tsx      # Bug submission form
│   └── BugList.tsx      # Bug list with filtering
└── types/
    └── bug.ts           # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Bug Properties

- **Title:** Brief description of the bug
- **Description:** Detailed information, steps to reproduce
- **Severity:** Low, Medium, High, Critical
- **Priority:** Low, Medium, High, Urgent
- **Status:** Open, In Progress, Resolved, Closed
- **Reported By:** Name of the person reporting
