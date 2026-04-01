# Smart Class Scheduler

A full-stack school management web app for teachers and students.

## Live Demo

- App: [https://smart-class-scheduler-eight-beta.vercel.app](https://smart-class-scheduler-eight-beta.vercel.app)
- GitHub: [https://github.com/reetikkumar736997-ai/smart-class-scheduler](https://github.com/reetikkumar736997-ai/smart-class-scheduler)

## Overview

Smart Class Scheduler is a role-based academic platform where teachers can manage the timetable, announcements, and study materials, and students can view the final schedule and access uploaded resources.

## Features

- Teacher and student login
- Teacher-managed timetable entry system
- Student timetable view
- Announcements panel
- PDF study material upload and download
- Rule-based study chatbot
- Light mode and dark mode toggle
- Responsive UI for desktop and mobile

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma ORM
- Supabase Postgres
- Supabase Storage
- Vercel

## Demo Credentials

- Teacher: `teacher@smartclass.edu` / `teacher123`
- Student: `student@smartclass.edu` / `student123`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Add environment variables in `.env.local`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_BUCKET=materials
DATABASE_URL=your_supabase_pooling_connection_string
DIRECT_URL=your_supabase_direct_connection_string
```

3. Generate Prisma client:

```bash
npm run db:generate
```

4. Push the schema:

```bash
npm run db:push
```

5. Start the app:

```bash
npm run dev
```

## Production Deployment

The app is deployed on Vercel and uses:

- Supabase Postgres for persistent data
- Supabase Storage for materials upload
- Prisma for database access

## Resume Description

Built and deployed a full-stack Smart Class Scheduler web application for teachers and students using Next.js, React, Prisma, PostgreSQL, Supabase, and Vercel. Implemented role-based login, teacher-managed timetable creation, announcements, study material uploads, dark/light mode, and a rule-based academic chatbot.
