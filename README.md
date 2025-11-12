## StoryBeyond (React + Vite + Tailwind + Supabase)

Post‑mortem storytelling MVP where users create stories with images, save them, and view them in a personal dashboard.

### Tech
- React 18 + Vite
- TailwindCSS
- Supabase (Auth, DB, Storage) via `@supabase/supabase-js`

### Quick start
1) Install deps:

```bash
npm install
```

2) Create `.env` in the project root:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3) Tailwind is preconfigured. Start dev:

```bash
npm run dev
```

4) Build:

```bash
npm run build && npm run preview
```

### Supabase setup
Run the SQL in `supabase/setup.sql` in your Supabase SQL editor:

- Creates `stories` table
- Enables Row Level Security
- Adds policies so users can only read/write their own rows

Create a public storage bucket named `story-images` in Storage settings.

### Storage
The app uploads to `story-images/stories/<uuid>.<ext>` and uses public URLs.

### Routes
- `/login`, `/signup`
- `/dashboard` (protected)
- `/story/new` (protected)
- `/story/:id/edit` (protected)

### Notes
- Form validation uses Zod
- Loading and error states included
- Auth context manages session and protected routes

### Deploying on Vercel
1) Import this repo in Vercel
2) Framework preset: Vite
3) Build command: `npm run build`
4) Output directory: `dist`
5) Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`


