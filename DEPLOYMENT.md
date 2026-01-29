# Deployment Guide

Deploy your AI Interview Bot to production in minutes!

## 🚀 Vercel (Recommended - Easiest)

### Why Vercel?
- ✅ Made by Next.js creators
- ✅ Zero configuration
- ✅ Automatic deployments from Git
- ✅ Free SSL certificates
- ✅ Edge network (fast globally)
- ✅ Generous free tier

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js

3. **Add Environment Variables**
   In Vercel project settings:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

5. **Update Firebase Settings**
   - Add your Vercel domain to Firebase Auth authorized domains
   - Go to Firebase Console > Authentication > Settings > Authorized domains
   - Add: `your-app.vercel.app`

### Automatic Deployments
Every push to `main` branch auto-deploys! 🔄

---

## 🔥 Firebase Hosting (Alternative)

### Why Firebase Hosting?
- ✅ Perfect Firebase integration
- ✅ Free SSL & custom domain
- ✅ CDN hosting
- ✅ Easy rollbacks

### Deployment Steps

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory: `out`
   - Configure as single-page app: Yes
   - Don't overwrite index.html

4. **Update package.json**
   ```json
   {
     "scripts": {
       "build": "next build",
       "export": "next export",
       "deploy": "npm run build && firebase deploy"
     }
   }
   ```

5. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

6. **Access Your App**
   - URL: `https://your-project-id.web.app`

---

## 🌐 Netlify (Alternative)

### Deployment Steps

1. **Push to GitHub** (see Vercel steps)

2. **Import to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect to GitHub
   - Select repository

3. **Configure Build**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Add environment variables

4. **Deploy**
   - Click "Deploy site"
   - Done! 🎉

---

## 🐳 Docker (Advanced)

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### Build & Run

```bash
docker build -t ai-interview-bot .
docker run -p 3000:3000 --env-file .env.local ai-interview-bot
```

### Deploy to Cloud Run, Railway, Render, etc.

---

## ⚙️ Environment Variables for Production

### Required Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Optional Variables
```env
NEXT_PUBLIC_ELEVENLABS_API_KEY=  # For advanced TTS
```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Firebase Firestore security rules configured
- [ ] Firebase Auth authorized domains added
- [ ] Environment variables set in hosting platform
- [ ] `.env.local` added to `.gitignore`
- [ ] No API keys committed to Git
- [ ] HTTPS enabled (automatic on Vercel/Netlify/Firebase)
- [ ] CORS configured if needed

---

## 📊 Post-Deployment

### Monitor Usage
- Firebase Console > Usage and billing
- Check Vertex AI usage
- Monitor Firestore reads/writes

### Set Up Budget Alerts
- Go to [GCP Console](https://console.cloud.google.com/)
- Billing > Budgets & alerts
- Set up email alerts

### Custom Domain (Optional)
- Buy domain from Namecheap, GoDaddy, etc.
- Add to Vercel/Netlify/Firebase
- Update DNS records
- Add to Firebase authorized domains

---

## 🐛 Common Deployment Issues

### "Environment variables not working"
- Ensure variables start with `NEXT_PUBLIC_`
- Redeploy after adding variables
- Check variable names match exactly

### "Firebase Auth errors"
- Add deployment domain to Firebase authorized domains
- Check Firebase config values are correct

### "Build fails"
- Check Node.js version (18+ required)
- Run `npm run build` locally first
- Check error logs in deployment platform

### "Vertex AI not working in production"
- Ensure Blaze plan is active
- Check Firebase project ID matches
- Verify Vertex AI is enabled

---

## 🎯 Recommended: Vercel + Firebase

**Best setup for this project:**
- Vercel for hosting (frontend)
- Firebase for backend (Auth, Firestore, Vertex AI)
- Free tier sufficient for development
- Easy to scale

---

## 📈 Scaling Tips

### Free Tier Limits
- Vercel: 100GB bandwidth/month
- Firebase: 50K Firestore reads/day
- Vertex AI: Generous free quota

### When to Upgrade
- Consistent traffic >10K users/month
- Firestore operations exceeding free tier
- Need more Vertex AI requests

### Cost Optimization
- Use Firestore efficiently (batch operations)
- Cache responses where possible
- Monitor Vertex AI token usage
- Use Gemini Flash (cheaper) instead of Pro

---

**Ready to deploy? Choose Vercel for the easiest experience! 🚀**
