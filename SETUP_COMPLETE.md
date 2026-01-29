# ✅ Your Firebase Configuration is Set!

## Firebase Project: ai-interview-bot-18

### What's Already Configured:

✅ **Firebase Credentials** - Added to `lib/firebase.ts` and `.env.local`
✅ **Authentication** - Email/Password + Google OAuth enabled
✅ **Firestore Database** - Created and ready
✅ **Project ID**: `ai-interview-bot-18`

### Next Steps to Enable AI:

Since you're on the **Spark (Free) Plan**, you need to upgrade to **Blaze Plan** to use Vertex AI (Firebase AI Logic):

#### Option 1: Upgrade to Blaze Plan (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/project/ai-interview-bot-18)
2. Click **Upgrade** in the bottom left
3. Select **Blaze - Pay as you go**
4. Add billing information (credit card required)

**Don't worry about costs:**
- Free tier is VERY generous
- Typical usage: $0-$5/month for small projects
- You only pay for what you use beyond free tier
- Can set budget alerts

#### Option 2: Use Personal Gemini API Key (Quick Test)

If you just want to test without billing:

1. Get free API key: https://aistudio.google.com/app/apikey
2. Update `lib/firebase.ts` to use personal key (temporary solution)

### After Enabling Blaze Plan:

1. **Enable Vertex AI in Firebase:**
   - Go to: https://console.firebase.google.com/project/ai-interview-bot-18/vertexai
   - Click "Get Started"
   - Follow the wizard

2. **Run your app:**
   ```bash
   npm run dev
   ```

3. **Test it:**
   - Open http://localhost:3000
   - Sign in with email or Google
   - Configure an interview
   - Start practicing!

### Firestore Security Rules

Make sure to add these rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /interviews/{interviewId} {
      allow read, write: if request.auth != null && 
        (request.resource.data.userId == request.auth.uid || 
         resource.data.userId == request.auth.uid);
    }
  }
}
```

### What's Using AI:

1. **Question Generation** - `/api/generate-questions`
2. **Answer Evaluation** - `/api/evaluate-answer`
3. **Overall Feedback** - `/api/overall-evaluation`

All three endpoints use `generateAIContent()` from `lib/firebase.ts` which calls Gemini through Firebase!

### Troubleshooting:

❌ **"Vertex AI not available"**
→ Enable Blaze plan first, then enable Vertex AI

❌ **"Permission denied"**
→ Check that you're logged in and Firestore rules are set

❌ **"Failed to generate questions"**
→ Make sure Vertex AI is enabled in Firebase Console

### Ready to Deploy?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel deployment instructions!

---

**Your credentials are secure** - they're in `.env.local` which is gitignored! 🔒
