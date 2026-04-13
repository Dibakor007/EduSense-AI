# Voice Assistant Troubleshooting Guide

## Error: "Failed to process voice command"

### Common Causes and Solutions

#### 1. API Key Not Set or Invalid

**Problem**: The `API_KEY` environment variable is not properly configured.

**Solution**:

```bash
# Check if .env file exists in project root
# If not, create it with:
echo API_KEY=your_gemini_api_key_here > .env

# Or add to existing .env:
API_KEY=AIzaSyDWGRqbKlKaZJ0agH0FglsfB1s2z4sHmqg
```

**Verify**:

1. Restart the dev server after adding/changing the API key
2. Check browser console (F12) for API key warnings
3. Ensure no extra spaces in the API key

#### 2. Vite Dev Server Not Reloaded

**Problem**: Environment variables are loaded at build time.

**Solution**:

```bash
# Stop the dev server (Ctrl+C)
npm run dev
# The dev server will reload and pick up new env variables
```

#### 3. Check Browser Console for Detailed Errors

**Solution**:

1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages that show:
   - API authentication errors
   - Network errors
   - Missing API key warnings

#### 4. Network/Connection Issues

**Problem**: Internet connection is unstable or Gemini API is down.

**Solution**:

```bash
# Test API connection manually
# Open browser console and run:
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contents: [{ parts: [{ text: 'test' }] }] })
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e))
```

#### 5. API Rate Limit or Quota Exceeded

**Problem**: Too many API requests have been made.

**Solution**:

1. Check your Gemini API quota at https://console.cloud.google.com/
2. Wait a few minutes before retrying
3. Consider implementing rate limiting

#### 6. Invalid API Key

**Problem**: The API key is expired or invalid.

**Solution**:

```bash
# Generate a new API key from:
# https://ai.google.dev/

# Replace old key in .env file
API_KEY=new_key_here

# Restart dev server
npm run dev
```

---

## Debugging Steps

### Step 1: Verify API Key is Set

```bash
# In project terminal, run:
echo $env:API_KEY  # PowerShell
# or
echo $API_KEY  # Bash

# Should output your API key
```

### Step 2: Check Vite Config

```bash
# Verify vite.config.ts has:
define: {
  "process.env.API_KEY": JSON.stringify(env.API_KEY || env.GEMINI_API_KEY || ""),
}
```

### Step 3: Monitor Console Logs

1. Open browser DevTools (F12)
2. Go to Console tab
3. Trigger the voice command
4. Look for messages like:
   - "Warning: API_KEY environment variable is not set"
   - API errors with status codes
   - Network timeout errors

### Step 4: Test Simplified Request

Create a test file to verify API key works:

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY" });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello, can you hear me?",
    });
    console.log("Success:", response.text);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
```

---

## Error Messages Reference

| Error                             | Cause                      | Solution                       |
| --------------------------------- | -------------------------- | ------------------------------ |
| "Failed to process voice command" | API key missing or invalid | Set API_KEY in .env            |
| "INVALID_API_KEY"                 | API key is wrong           | Regenerate from ai.google.dev  |
| "RESOURCE_EXHAUSTED"              | Quota exceeded             | Wait or upgrade plan           |
| "PERMISSION_DENIED"               | API not enabled            | Enable Generative Language API |
| Network timeout                   | Connection issue           | Check internet, restart server |
| Empty response                    | API error                  | Check API status, try again    |

---

## Quick Checklist

- [ ] API key obtained from https://ai.google.dev/
- [ ] API_KEY set in .env file
- [ ] Dev server restarted after setting API_KEY
- [ ] No extra spaces in API key
- [ ] .env file is not in .gitignore (wait, it should be!)
- [ ] Microphone permissions granted
- [ ] Internet connection working
- [ ] Browser DevTools console checked for errors
- [ ] Gemini API quota not exceeded

---

## Still Having Issues?

### Check These Files

1. **voiceService.ts** - Logs initialization message with API key status
2. **VoiceBasedLearningAssistant.tsx** - Logs detailed error messages
3. **vite.config.ts** - Confirms env variables are passed correctly
4. **.env** - Contains API_KEY

### Enable Detailed Logging

Add this to voiceService.ts at the top:

```typescript
console.log("API_KEY loaded:", !!process.env.API_KEY);
console.log("API_KEY value:", process.env.API_KEY?.substring(0, 10) + "...");
```

### Contact Support

If issues persist:

1. Check Gemini API documentation: https://ai.google.dev/docs
2. Review browser console for specific error codes
3. Try in a different browser
4. Clear browser cache and restart

---

## Prevention Tips

1. **Always restart dev server** after changing .env
2. **Keep API key safe** - never commit to git
3. **Monitor API usage** at https://console.cloud.google.com/
4. **Test API key** immediately after generating
5. **Enable detailed logging** during development

---

## Success Indicators

When working correctly, you should see:

- ✅ "Start Listening" button is clickable
- ✅ Microphone icon appears
- ✅ Real-time transcript appears while speaking
- ✅ AI response generates within 2-3 seconds
- ✅ Response is spoken aloud
- ✅ No errors in browser console

---

**Last Updated**: December 14, 2025
