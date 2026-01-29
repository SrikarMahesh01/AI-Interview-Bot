# AI-Powered Interview Bot

An intelligent interview preparation platform that conducts personalized, AI-driven interview sessions tailored to your domain, difficulty level, and preferred assessment format using **Firebase Vertex AI (Gemini 2.0 Flash)**.

## 🚀 Features

- **🔐 Firebase Authentication**: Secure login with email/password and Google OAuth
- **🤖 AI-Powered Questions**: Dynamic question generation using Firebase Vertex AI (Gemini)
- **💬 Verbal Interview Mode**: Conversational interviews with voice input support
- **💻 Coding Interview Mode**: Integrated Monaco code editor with real-time test execution
- **📊 Comprehensive Feedback**: Detailed performance analysis with actionable insights
- **📈 Progress Tracking**: View interview history and track improvement over time
- **🎯 Personalized Configuration**: Choose domain, difficulty, topics, and interview format

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Authentication**: Firebase Auth (Email + Google OAuth)
- **Database**: Cloud Firestore
- **AI Engine**: Firebase Vertex AI (Gemini 2.0 Flash) - **No personal API key required!**
- **Code Editor**: Monaco Editor (VS Code editor)
- **UI Components**: Lucide React Icons, React Hot Toast

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account (free tier works!)
- Basic knowledge of Next.js and React

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ai-interview-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Enable Google Analytics (optional)

#### Enable Firebase Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get Started"
3. Enable **Email/Password** authentication
4. Enable **Google** authentication
   - Click on Google provider
   - Enable and add your support email

#### Enable Cloud Firestore

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Start in **test mode** (or production mode with custom rules)
4. Choose your preferred location
5. Click "Enable"

#### Set Up Firestore Security Rules

Replace the default rules with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Interviews collection
    match /interviews/{interviewId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

#### Enable Vertex AI (Gemini) in Firebase 🎯

**This is the key feature - No personal API key needed!**

1. In Firebase Console, go to **Build > Vertex AI in Firebase**
2. Click "Get Started" or "Upgrade project" if needed
3. The **Gemini 2.0 Flash** model is available on Firebase!
4. No API key required - uses Firebase authentication automatically

**Important Notes**:
- Vertex AI in Firebase is currently in preview
- Requires Firebase Blaze (pay-as-you-go) plan
- Has generous free tier for Gemini models
- More secure than personal API keys

#### Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Register your app (nickname: "AI Interview Bot")
5. Copy the Firebase configuration

### 4. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Note: Gemini AI is integrated via Firebase Vertex AI
# No separate GEMINI_API_KEY needed! 🎉

# Optional: ElevenLabs for advanced TTS (not required)
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key
```

Replace the placeholder values with your actual Firebase configuration.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage Guide

### First Time Setup

1. **Sign Up/Sign In**
   - Create account with email/password or use Google Sign-In
   - Your profile is automatically created in Firestore

2. **Configure Interview**
   - Select domain (DSA, Python, JavaScript, Web Dev, System Design, Database)
   - Choose difficulty level (Beginner, Intermediate, Advanced)
   - Pick specific topics (multiple selection allowed)
   - Choose format: Verbal or Coding

3. **Start Interview**
   - **Verbal Mode**: Answer conceptual questions via text or voice
   - **Coding Mode**: Solve coding problems with test case validation

4. **Get Feedback**
   - View overall score and performance summary
   - See topic-wise breakdown
   - Read strengths, weaknesses, and recommendations

5. **Track Progress**
   - View interview history on dashboard
   - Monitor improvement over time

## 📁 Project Structure

```
ai-interview-bot/
├── app/
│   ├── api/                    # API routes
│   │   ├── evaluate-answer/    # AI answer evaluation
│   │   ├── execute-code/       # Code execution
│   │   ├── generate-questions/ # AI question generation
│   │   └── overall-evaluation/ # Final feedback
│   ├── dashboard/              # Dashboard page
│   ├── interview/              # Interview session page
│   ├── layout.tsx              # Root layout with AuthProvider
│   └── page.tsx                # Home page
├── components/
│   ├── AuthForm.tsx            # Login/signup form
│   ├── CodingInterview.tsx    # Coding mode interface
│   ├── Dashboard.tsx           # User dashboard
│   ├── InterviewConfigurator.tsx # Setup wizard
│   ├── InterviewFeedback.tsx  # Results display
│   └── VerbalInterview.tsx    # Verbal mode interface
├── contexts/
│   └── AuthContext.tsx         # Authentication context
├── lib/
│   ├── constants.ts            # App constants (domains, topics)
│   └── firebase.ts             # Firebase & Vertex AI config
├── types/
│   └── interview.ts            # TypeScript interfaces
└── .env.local                  # Environment variables (gitignored)
```

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use Firestore Security Rules** - Protect user data
3. **Server-side validation** - Don't trust client input
4. **Monitor Firebase usage** - Check quotas regularly
5. **Vertex AI advantage** - No exposed API keys in client code!

## 🎨 Customization

### Add New Domains

Edit `lib/constants.ts`:

```typescript
export const DOMAINS = [
  // Add your custom domain
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    topics: ['Supervised Learning', 'Neural Networks', 'NLP', 'Computer Vision'],
  },
];
```

### Modify AI Prompts

Edit API routes in `app/api/*/route.ts` to customize:
- Question generation prompts (`generate-questions/route.ts`)
- Evaluation criteria (`evaluate-answer/route.ts`)
- Feedback style (`overall-evaluation/route.ts`)

### Change UI Theme

Modify Tailwind classes in components or update `tailwind.config.ts`.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables from `.env.local`
4. Deploy!

**Important**: Make sure to add all `NEXT_PUBLIC_*` variables in Vercel environment settings.

### Other Platforms

- **Netlify**: Works with minor configuration
- **Firebase Hosting**: Perfect integration with Firebase backend
- **Railway/Render**: Good for full-stack apps

## 📊 Firebase Quotas (Blaze Plan with Free Tier)

- **Authentication**: Unlimited
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day (free tier)
- **Vertex AI (Gemini)**: Generous free tier, then pay-per-use
- **Hosting**: 10GB storage, 360MB/day bandwidth (free tier)

💡 **Tip**: The Blaze plan only charges for usage beyond free tier!

## 🐛 Troubleshooting

### "Vertex AI not available"
- Upgrade to Blaze (pay-as-you-go) plan
- Enable Vertex AI in Firebase Console
- Check if available in your region
- Ensure you're using the preview version

### "Permission denied" errors
- Check Firestore security rules
- Ensure user is authenticated
- Verify Firebase configuration in `.env.local`

### Speech recognition not working
- Use Chrome/Edge browser (best support)
- Grant microphone permissions
- Ensure HTTPS (required for mic access)
- Check browser console for errors

### Code execution issues
- JavaScript code works out of the box
- Other languages show mock results (implement proper sandbox for production)

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

## 🔄 Migration from Personal API Key

If you previously used `@google/generative-ai` with a personal API key:

1. ✅ Already migrated to `firebase/vertexai-preview`
2. ✅ No `GEMINI_API_KEY` needed in `.env.local`
3. ✅ More secure - API calls authenticated via Firebase
4. ✅ Better quota management through Firebase

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit (`git commit -m 'Add amazing feature'`)
5. Push (`git push origin feature/amazing-feature`)
6. Submit a pull request

## 📝 License

MIT License - feel free to use for personal or commercial projects!

## 🙏 Acknowledgments

- **Firebase** for backend infrastructure and Vertex AI integration
- **Google Gemini** for AI capabilities
- **Vercel** for Next.js framework and hosting
- **Monaco Editor** for professional code editing experience

## 📧 Support

For issues or questions:
- Create a GitHub issue
- Check [Firebase Documentation](https://firebase.google.com/docs)
- Review [Next.js Docs](https://nextjs.org/docs)
- Check [Vertex AI in Firebase](https://firebase.google.com/docs/vertex-ai)

---

**Built with ❤️ using Next.js, Firebase, and Gemini AI**

🌟 **Star this repo if you find it helpful!**

**Key Advantage**: No personal API key management - everything handled securely through Firebase! 🔒
