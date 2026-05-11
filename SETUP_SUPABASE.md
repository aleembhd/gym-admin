# Supabase Setup Instructions

## The Problem
The error "Could not find the table 'public.members' in the schema cache" means the `members` table doesn't exist in your Supabase database yet.

## Solution: Create the Table

### Step 1: Go to Supabase SQL Editor
1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `zibkfxmqglvmpuzaohky`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run This SQL

Copy and paste this entire SQL script and click **Run**:

```sql
-- Create the members table
CREATE TABLE IF NOT EXISTS public.members (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    joined TEXT,
    amount NUMERIC,
    plan_months INTEGER
);

-- Enable Row Level Security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read, insert, update, and delete
CREATE POLICY "Allow all access"
ON public.members
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Insert sample data
INSERT INTO public.members (name, phone, email, created_at)
VALUES 
    ('Croxton Technologies', '7878888888', 'croxtontechnologies@gmail.com', NOW() - INTERVAL '2 days'),
    ('Abdul Aleem', '7672029401', 'abdul.aleem4020@gmail.com', NOW() - INTERVAL '1 day'),
    ('Rahul Sharma', '9876543210', 'rahul.sharma@gmail.com', NOW())
ON CONFLICT DO NOTHING;
```

### Step 3: Verify the Table

After running the SQL, run this to verify:

```sql
SELECT * FROM public.members;
```

You should see the 3 sample members.

### Step 4: Restart Your App

```bash
# Stop the dev server (Ctrl+C)
npm run dev
```

Refresh the browser and the data should load!

---

## Alternative: If Table Already Exists

If you already have a `members` table but it's not being found, the issue might be:

### Option A: Wrong Schema
Your table might be in a different schema. Check with:

```sql
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name = 'members';
```

### Option B: RLS Blocking Access
Add these policies:

```sql
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access"
ON public.members
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
```

### Option C: Different Table Name
If your table has a different name, update `src/App.tsx`:

Find this line (around line 95):
```typescript
.from('members')
```

Change `'members'` to your actual table name.

---

## Quick Test

After creating the table, test it directly in Supabase:

1. Go to **Table Editor** in Supabase
2. You should see the `members` table
3. Click on it to view the data
4. Try adding a new row manually

If you can see and edit the table in Supabase, the app will work!
