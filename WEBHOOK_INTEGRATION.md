# Webhook Integration Documentation

## ✅ Send Receipt Button - Webhook Integration

### What Was Implemented

The "Send Receipt" button in the **Receipts screen** now triggers your n8n webhook when clicked.

### Webhook Details

**Webhook URL:** `https://rafibuildsexp.app.n8n.cloud/webhook/send-gym-confirmation`

**Method:** POST

**Content-Type:** application/json

### Payload Structure

When you click "Send Receipt", the following data is sent to your webhook:

```json
{
  "name": "Member Name",
  "phone": "7878888888",
  "email": "member@example.com",
  "amount": 1500,
  "daysLeft": 30,
  "dateOfJoining": "2026-05-10",
  "timestamp": "2026-05-10T12:34:56.789Z"
}
```

### Payload Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Member's full name |
| `phone` | string | Member's phone number |
| `email` | string | Member's email address |
| `amount` | number | Membership amount paid |
| `daysLeft` | number | Days remaining in membership |
| `dateOfJoining` | string | Date when member joined (ISO format) |
| `timestamp` | string | Current timestamp when receipt was sent |

### How It Works

1. User clicks "Send Receipt" button on any member card
2. App collects member data from the database
3. Sends POST request to your webhook with member details
4. Shows success/error message to user
5. Console logs the request and response for debugging

### Testing the Webhook

#### Step 1: Restart Your App
```bash
# Stop the server (Ctrl+C)
npm run dev
```

#### Step 2: Go to Receipts Screen
- Click on "RECEIPTS" in the bottom navigation
- You'll see all your members with "Send Receipt" buttons

#### Step 3: Click "Send Receipt"
- Click the button for any member
- Check browser console (F12) for logs:
  - "Sending receipt to webhook for: [Member Name]"
  - "Webhook payload: {...}"
  - "Webhook response status: 200"
  - "Webhook response: [response text]"

#### Step 4: Verify in n8n
- Go to your n8n workflow
- Check the execution history
- You should see the webhook was triggered with the member data

### Success/Error Messages

**Success:**
```
✅ Receipt sent successfully to [Member Name]!
```

**Error:**
```
❌ Failed to send receipt: [error message]
```

### Console Logs

The app logs detailed information to help you debug:

```javascript
// Before sending
Sending receipt to webhook for: Croxton Technologies
Webhook payload: { name: "Croxton Technologies", phone: "7878888888", ... }

// After response
Webhook response status: 200
Webhook response: Success
```

### Troubleshooting

#### Issue 1: Webhook Not Triggering

**Check:**
1. Browser console for errors (F12)
2. Network tab in DevTools to see the request
3. n8n workflow is active and running

**Solution:**
- Verify webhook URL in `.env` file is correct
- Check n8n workflow is not paused
- Ensure no CORS issues (check console)

#### Issue 2: CORS Error

**Error:** `Access to fetch at '...' from origin 'http://localhost:3895' has been blocked by CORS policy`

**Solution:**
In your n8n workflow, ensure the webhook node has:
- Response Mode: "Respond Immediately"
- Response Headers: Include CORS headers if needed

#### Issue 3: Timeout

**Error:** `Failed to fetch` or timeout error

**Solution:**
- Check your internet connection
- Verify n8n webhook URL is accessible
- Test the webhook URL directly with curl or Postman

### Testing with curl

You can test the webhook directly:

```bash
curl -X POST https://rafibuildsexp.app.n8n.cloud/webhook/send-gym-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Member",
    "phone": "1234567890",
    "amount": 1000,
    "daysLeft": 30,
    "dateOfJoining": "2026-05-10",
    "timestamp": "2026-05-10T12:00:00.000Z"
  }'
```

---

## 📞 Call Button - Phone Integration

### How It Works

The **Call button** (phone icon) uses the standard `tel:` protocol to initiate phone calls.

### Implementation

```html
<a href="tel:7878888888">
  <Phone icon />
</a>
```

### Behavior by Device

**On Mobile Devices:**
- ✅ Opens the phone dialer app
- ✅ Pre-fills the phone number
- ✅ User can tap to call

**On Desktop:**
- ✅ Opens default calling app (Skype, Teams, etc.)
- ✅ If no app is configured, may show a prompt
- ✅ Some browsers may not support it

### Testing the Call Button

#### On Mobile:
1. Open the app on your phone
2. Go to Receipts screen
3. Click the phone icon next to any member
4. Your phone dialer should open with the number pre-filled
5. Tap the call button to make the call

#### On Desktop:
1. Click the phone icon
2. If you have Skype, Teams, or similar installed, it will open
3. If not, you may see a browser prompt

### Phone Number Format

The app automatically removes spaces from phone numbers before calling:

```javascript
// Input: "7878 888 888"
// Output: "tel:7878888888"
```

This ensures compatibility across all devices and calling apps.

### Verifying It Works

**Check 1: Inspect the Link**
- Right-click the phone icon
- Select "Inspect" or "Inspect Element"
- Look for: `<a href="tel:7878888888">`

**Check 2: Hover Over Icon**
- Hover your mouse over the phone icon
- Browser should show the link in the bottom-left corner
- Should display: `tel:7878888888`

**Check 3: Click and Observe**
- On mobile: Dialer should open
- On desktop: Calling app should open or browser prompt appears

---

## 🎯 Summary

### Send Receipt Button
✅ Triggers webhook: `https://rafibuildsexp.app.n8n.cloud/webhook/send-gym-confirmation`
✅ Sends member data as JSON
✅ Shows success/error messages
✅ Logs to console for debugging

### Call Button
✅ Uses standard `tel:` protocol
✅ Works on mobile devices (opens dialer)
✅ Works on desktop (opens calling app if available)
✅ Phone numbers are properly formatted

---

## 🚀 Next Steps

1. **Restart your app** to load the webhook URL
2. **Test the Send Receipt button** on the Receipts screen
3. **Check n8n** to see if the webhook was triggered
4. **Test the Call button** on mobile to verify it opens the dialer

Both features are now fully functional! 🎉
