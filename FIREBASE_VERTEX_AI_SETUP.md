# Firebase Vertex AI Setup Guide

This project uses **Firebase Vertex AI** for Gemini integration instead of personal API keys. This is more secure and integrated with Firebase authentication.

## Why Firebase Vertex AI?

✅ **No personal API key needed**
✅ **Better security** - API calls authenticated via Firebase
✅ **Integrated billing** - Part of Firebase/GCP
✅ **Better quota management**
✅ **Production-ready** - Scalable infrastructure

## Setup Steps

### 1. Upgrade to Blaze Plan

Firebase Vertex AI requires the Blaze (pay-as-you-go) plan:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click "Upgrade" in the bottom left
4. Choose "Blaze - Pay as you go"
5. Add billing account (requires credit card)

**Don't worry**: The free tier is very generous, and you'll only pay for usage beyond it!

### 2. Enable Vertex AI in Firebase

1. In Firebase Console, click **Build** in the left sidebar
2. Find and click **Vertex AI in Firebase** (might be under "Extensions" or "All products")
3. Click "Get Started"
4. Follow the setup wizard
5. Grant necessary permissions

### 3. Verify Setup

The Firebase SDK will automatically:
- Authenticate requests using Firebase Auth
- Use your project's Vertex AI quota
- Handle model initialization

### 4. Code Implementation (Already Done!)

```typescript
// lib/firebase.ts
import { getVertexAI, getGenerativeModel } from 'firebase/vertexai-preview';

export const vertexAI = getVertexAI(app);

export const getGeminiModel = () => {
  return getGenerativeModel(vertexAI, {
    model: 'gemini-2.0-flash-exp',
  });
};
```

## Available Models

- `gemini-2.0-flash-exp` - Latest Gemini 2.0 Flash (recommended)
- `gemini-1.5-flash` - Gemini 1.5 Flash
- `gemini-1.5-pro` - Gemini 1.5 Pro (more powerful, higher cost)

## Pricing (as of January 2026)

### Gemini 2.0 Flash
- **Free tier**: Generous requests per day
- **Paid**: After free tier, pay per token

Check current pricing: [Firebase Vertex AI Pricing](https://firebase.google.com/pricing)

## Troubleshooting

### "Vertex AI not available in console"
- Ensure project is on Blaze plan
- Check if feature is enabled in your region
- Try accessing via "All products" menu

### "Permission denied" errors
```bash
# Check your Firebase configuration
# Make sure NEXT_PUBLIC_FIREBASE_* env vars are set correctly
```

### "Model not found"
```typescript
// Try switching to a stable model
model: 'gemini-1.5-flash'  // Instead of gemini-2.0-flash-exp
```

### Billing concerns
- Monitor usage in [Firebase Console > Usage and billing](https://console.firebase.google.com/)
- Set up budget alerts in GCP Console
- Free tier covers typical development and small-scale production

## Migration from Personal API Key

If you previously used `@google/generative-ai`:

### Old Way (with personal API key):
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
```

### New Way (with Firebase Vertex AI):
```typescript
import { getVertexAI, getGenerativeModel } from 'firebase/vertexai-preview';
const vertexAI = getVertexAI(app);
const model = getGenerativeModel(vertexAI, { model: 'gemini-2.0-flash-exp' });
```

## Benefits Summary

| Aspect | Personal API Key | Firebase Vertex AI |
|--------|------------------|-------------------|
| Security | ⚠️ Key in code | ✅ Firebase Auth |
| Setup | Simple | Moderate |
| Production | ❌ Not recommended | ✅ Production-ready |
| Monitoring | Limited | ✅ Full GCP monitoring |
| Cost | Per key | Per project |
| Quotas | Per key | Better management |

## Resources

- [Firebase Vertex AI Documentation](https://firebase.google.com/docs/vertex-ai)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [GCP Vertex AI](https://cloud.google.com/vertex-ai)

---

**This project is already configured to use Firebase Vertex AI!** Just follow the setup steps above.
