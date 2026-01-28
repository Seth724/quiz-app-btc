# Quiz App Frontend

This is the frontend application for the Quiz App built with Next.js and Bitcoin Computer.

## Features

- Teacher interface for creating and managing quizzes
- Student interface for taking quizzes
- Wallet integration for payment handling
- Real-time quiz management

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Dependencies

This package depends on:
- `@quiz-app/contracts` - Smart contracts and business logic
- Next.js - React framework
- React - UI library
- Tailwind CSS - Styling

## Directory Structure

- `src/app/` - Next.js app router pages
- `src/app/components/` - React components
- `src/app/common-components/` - Shared components
- `public/` - Static assets