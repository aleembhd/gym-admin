# Quick Start Guide

## ✅ What's Been Done

Your gym management app now fetches data directly from your Supabase database!

## 🎯 Key Features

### 1. **"NEW" Tag**
- Shows on members for 4 days after they're created in the database
- Based on the `created_at` column
- Automatically disappears after 4 days

### 2. **Days Left Calculation**
- When you select a plan (e.g., "3 Months"):
  - Today's date is saved to the `joined` column
  - Days left = (joined date + plan duration) - today
  - Example: 3 months = 90 days from joined date

### 3. **Amount Saving**
- Click "Set Amount" → Enter amount → Click ✓
- Saves directly to the `amount` column in database

### 4. **Smart Sorting**
- Members with < 7 days left appear at the top (urgent)
- Otherwise sorted by newest first (created_at)

## 🚀 Run the App

```bash
npm run dev
```

Then open: http://localhost:3895

## 📊 Database Columns Used

From your `members` table:
- `id` - Member ID
- `created_at` - For "NEW" tag calculation
- `name` - Member name
- `phone` - Phone number
- `email` - Email address
- `joined` - Date when plan was selected (saved by app)
- `amount` - Membership amount (saved by app)

## 🔧 How to Use

1. **Add a New Member in Supabase**
   - They'll appear with a "NEW" tag for 4 days

2. **Assign a Plan**
   - Click "Select Plan" dropdown
   - Choose duration (1-12 months)
   - Joined date is saved automatically
   - Days left is calculated

3. **Set Amount**
   - Click "Set Amount"
   - Enter the amount
   - Click the green checkmark
   - Amount is saved to database

## 💡 Tips

- Members with less than 7 days left show at the top with a red badge
- The "NEW" tag is automatic - no action needed
- All data persists in your Supabase database
- Refresh the page anytime - data is preserved

## 🐛 Troubleshooting

If you see errors:
1. Check that `.env` has correct Supabase credentials
2. Verify the table name is `members` in Supabase
3. Check browser console for specific error messages

## 📝 Optional Enhancement

Want to store plan duration in the database? Add this column:

```sql
ALTER TABLE members ADD COLUMN plan_months INTEGER;
```

The app already supports it! No code changes needed.
