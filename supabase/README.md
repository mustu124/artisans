# Artisan Root Supabase Setup

1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. Create a public storage bucket named `artisan-root`.
4. Add these env vars locally and on Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=artisan-root
```

5. Import product images:

```bash
npm run supabase:import
```

By default the importer reads:

```text
Artisan Root Product Photos for Website
```

You can pass another folder:

```bash
npm run supabase:import -- "C:\path\to\products"
```
