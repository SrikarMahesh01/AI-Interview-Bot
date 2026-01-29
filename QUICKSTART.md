# Quick Start Guide

Get your AI Interview Bot running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- Firebase account (create at [firebase.google.com](https://firebase.google.com))

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Firebase Setup (5 minutes)

### A. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" → Name it → Continue
3. (Optional) Enable Google Analytics → Create project

### B. Enable Authentication
1. In Firebase Console: **Build > Authentication > Get Started**
2. Enable **Email/Password** provider
3. Enable **Google** provider (add support email)

### C. Enable Firestore Database
1. **Build > Firestore Database > Create database**
2. Start in **test mode**
3. Choose location (closest to you)
4. Click **Enable**

### D. Enable Vertex AI (Gemini)
1. **Upgrade to Blaze plan** (pay-as-you-go, has free tier!)
2. **Build > Vertex AI in Firebase > Get Started**
3. Follow setup wizard

### E. Get Firebase Config
1. **Project Settings** (gear icon) → Scroll down
2. Click web icon (`</>`) → Register app
3. Copy the config values

## Step 3: Configure Environment

Create `.env.local` in project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 4: Run the App
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Try It Out!

1. **Sign up** with email or Google
2. **Configure** your interview (Domain, Difficulty, Topics, Format)
3. **Start** the interview
4. **Get feedback** on your performance

## Firestore Security Rules

In Firebase Console > Firestore Database > Rules, paste:

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

## Troubleshooting

❌ **"Vertex AI not available"**
→ Upgrade to Blaze plan in Firebase Console

❌ **"Permission denied"**
→ Check Firestore security rules & authentication

❌ **Build errors**
→ Delete `node_modules` and `.next`, run `npm install` again

❌ **Environment variables not loading**
→ Restart dev server after changing `.env.local`

## Next Steps

- Customize domains in `lib/constants.ts`
- Modify AI prompts in `app/api/*/route.ts`
- Deploy to Vercel (auto-detects Next.js)

## Need Help?

- 📚 Read [README.md](./README.md) for detailed docs
- 🔥 Check [FIREBASE_VERTEX_AI_SETUP.md](./FIREBASE_VERTEX_AI_SETUP.md) for Vertex AI details
- 🐛 Create a GitHub issue

---

**You're all set! Start practicing interviews! 🚀**
