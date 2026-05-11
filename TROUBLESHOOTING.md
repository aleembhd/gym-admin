# Troubleshooting Guide

## Error: "Failed to fetch members from database"

### Step 1: Restart the Dev Server
After changing the `.env` file, you MUST restart the dev server:

```bash
# Press Ctrl+C to stop the current server
# Then start it again:
npm run dev
```

### Step 2: Check Browser Console
1. Open the browser (where you see the error)
2. Press F12 to open Developer Tools
3. Go to the "Console" tab
4. Look for error messages
5. Share the error message you see

### Step 3: Test Supabase Connection
Open the `test-supabase.html` file in your browser:
1. Open the file directly in Chrome/Edge
2. Click "Test Connection" button
3. Check what error appears

### Common Issues & Solutions

#### Issue 1: Table Not Found
**Error:** `relation "members" does not exist`

**Solution:** 
- Check your Supabase dashboard
- Verify the table name is exactly `members` (lowercase)
- If it's different, update `src/App.tsx` line 95 to use the correct table name

#### Issue 2: Permission Denied (RLS)
**Error:** `permission denied` or `RLS policy`

**Solution:**
1. Go to Supabase Dashboard
2. Navigate to: Authentication → Policies
3. Find the `members` table
4. Add a policy to allow SELECT for anonymous users:

```sql
-- In Supabase SQL Editor, run:
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access"
ON members
FOR SELECT
TO anon
USING (true);
```

#### Issue 3: Invalid API Key
**Error:** `JWT` or `authentication`

**Solution:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the "anon public" key (not the service_role key!)
3. Update `.env` file with the correct key
4. Restart dev server

#### Issue 4: CORS Error
**Error:** `CORS` or `blocked by CORS policy`

**Solution:**
1. Go to Supabase Dashboard → Settings → API
2. Check "API URL" matches your `.env` file
3. Ensure you're using the `anon` key, not `service_role`

### Step 4: Verify Environment Variables

Check if environment variables are loaded:

1. Open browser console (F12)
2. Look for these logs:
   - "Supabase URL: https://..."
   - "Supabase Key exists: true"

If you see `undefined`, the `.env` file is not being loaded.

### Step 5: Check Table Structure

Your `members` table should have these columns:
- `id` (int8, primary key)
- `created_at` (timestamptz)
- `name` (text)
- `phone` (text)
- `email` (text)
- `joined` (text, nullable)
- `amount` (numeric, nullable)

### Step 6: Manual Test Query

In Supabase SQL Editor, run:

```sql
SELECT * FROM members LIMIT 5;
```

If this fails, the table doesn't exist or has a different name.

### Step 7: Check Network Tab

1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Refresh the page
4. Look for requests to `supabase.co`
5. Click on the request
6. Check the "Response" tab for error details

## Still Not Working?

Please provide:
1. The exact error message from browser console
2. Screenshot of your Supabase table structure
3. Result from the `test-supabase.html` test
4. Any error messages from the Network tab

## Quick Checklist

- [ ] Restarted dev server after changing `.env`
- [ ] Verified table name is `members` in Supabase
- [ ] Checked RLS policies allow anonymous SELECT
- [ ] Confirmed API key is the "anon public" key
- [ ] Verified `.env` file has no quotes around values
- [ ] Checked browser console for specific error messages
