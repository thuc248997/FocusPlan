# Deployment Guide

## Overview
This guide covers deploying your Chat AI application to various platforms.

## Prerequisites
- Git repository (push your code to GitHub/GitLab)
- Node.js 18+ on deployment platform
- Environment variables configured

## Deployment Options

### 1. Vercel (Recommended) ⭐

#### Why Vercel?
- Built by Next.js creators
- Zero-config deployment
- Automatic HTTPS
- CDN included
- Free tier available

#### Steps:
1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit: Chat AI app"
git push origin main
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

3. **Configure Environment Variables** (if needed)
   - Go to Project Settings → Environment Variables
   - Add your variables (e.g., `OPENAI_API_KEY`)

4. **Done!**
   - Your app is live at `your-project.vercel.app`

#### CLI Deployment:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

### 2. Netlify

#### Steps:
1. **Build command:** `npm run build`
2. **Publish directory:** `.next`
3. **Node version:** 18

#### Using Netlify CLI:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

---

### 3. Railway

#### Steps:
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Choose your repository
5. Railway auto-detects Next.js
6. Deploy!

#### Configuration:
- **Start Command:** `npm start`
- **Build Command:** `npm run build`

---

### 4. Docker Deployment

#### Create Dockerfile:
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

#### Docker Compose:
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

#### Deploy:
```bash
# Build
docker build -t chat-ai .

# Run
docker run -p 3000:3000 chat-ai

# Or use docker-compose
docker-compose up -d
```

---

### 5. AWS (EC2 / Elastic Beanstalk)

#### EC2 Manual Deployment:
```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-instance

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18

# Clone repository
git clone your-repo-url
cd your-repo

# Install and build
npm install
npm run build

# Install PM2
npm install -g pm2

# Start app
pm2 start npm --name "chat-ai" -- start
pm2 save
pm2 startup
```

#### Elastic Beanstalk:
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Create environment
eb create production

# Deploy
eb deploy
```

---

### 6. DigitalOcean App Platform

#### Steps:
1. Go to DigitalOcean App Platform
2. Create New App
3. Connect GitHub repository
4. Configure:
   - **Build Command:** `npm run build`
   - **Run Command:** `npm start`
   - **HTTP Port:** 3000
5. Deploy!

---

### 7. Heroku

#### Steps:
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add Node.js buildpack
heroku buildpacks:set heroku/nodejs

# Deploy
git push heroku main

# Open app
heroku open
```

#### Procfile:
```
web: npm start
```

---

## Environment Variables

### Required Variables (for production with real AI):
```bash
OPENAI_API_KEY=your_openai_key
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://your-domain.com
```

### Setting Variables:

#### Vercel:
```bash
vercel env add OPENAI_API_KEY
```

#### Netlify:
```bash
netlify env:set OPENAI_API_KEY your_key
```

#### Railway:
- Add in Railway dashboard under "Variables"

#### Docker:
```bash
docker run -e OPENAI_API_KEY=your_key -p 3000:3000 chat-ai
```

---

## Domain Configuration

### Custom Domain on Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS:
   - Type: A Record
   - Name: @
   - Value: (Vercel IP)
   - Or use CNAME to `cname.vercel-dns.com`

### SSL Certificate:
- Automatic on Vercel, Netlify, Railway
- Use Let's Encrypt for self-hosted

---

## Database Setup (Optional)

### PostgreSQL on Railway:
1. Create new PostgreSQL service
2. Copy connection string
3. Add to environment variables

### MongoDB Atlas:
1. Create free cluster at mongodb.com
2. Get connection string
3. Add to environment variables

### Supabase:
1. Create project at supabase.com
2. Get connection details
3. Configure in your app

---

## Performance Optimization

### Before Deployment:
1. **Optimize Images:**
```bash
npm install sharp
```

2. **Enable Caching:**
```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webif'],
  },
  compress: true,
}
```

3. **Analyze Bundle:**
```bash
npm install @next/bundle-analyzer
```

---

## Monitoring & Analytics

### Add Sentry (Error Tracking):
```bash
npm install @sentry/nextjs
```

### Add Google Analytics:
```bash
npm install nextjs-google-analytics
```

### Add Vercel Analytics:
```bash
npm install @vercel/analytics
```

---

## CI/CD Pipeline

### GitHub Actions:
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm test
```

---

## Security Checklist

- [ ] Environment variables secured
- [ ] API keys not in code
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting added
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection

---

## Post-Deployment

### 1. Test Everything:
- [ ] Homepage loads
- [ ] Chat functionality works
- [ ] Mobile responsive
- [ ] All routes accessible
- [ ] No console errors

### 2. Set Up Monitoring:
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring
- [ ] Performance monitoring
- [ ] User analytics

### 3. Configure CDN:
- [ ] Static assets cached
- [ ] Images optimized
- [ ] Gzip enabled

### 4. Backup Strategy:
- [ ] Database backups
- [ ] Code repository
- [ ] Environment variables

---

## Troubleshooting

### Build Fails:
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Port Already in Use:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

### Environment Variables Not Working:
- Restart deployment
- Check variable names (case-sensitive)
- Verify in platform dashboard

---

## Cost Estimates

### Free Tiers:
- **Vercel:** Hobby plan (free)
- **Netlify:** Starter plan (free)
- **Railway:** $5 credit/month
- **Heroku:** Free tier (with sleep)

### Paid (for scale):
- **Vercel Pro:** $20/month
- **Railway:** ~$10-30/month
- **AWS:** Variable, ~$20-100/month
- **DigitalOcean:** $12-48/month

---

## Scaling Considerations

### Vertical Scaling:
- Increase server resources
- More RAM/CPU

### Horizontal Scaling:
- Load balancer
- Multiple instances
- Database replication

### CDN:
- Cloudflare
- AWS CloudFront
- Vercel Edge Network

---

## Quick Deploy Commands

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# Railway
railway up

# Heroku
git push heroku main

# Docker
docker-compose up -d
```

---

## Need Help?

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com)

---

**Recommended:** Start with Vercel for easiest deployment, then scale as needed.

Good luck with your deployment! 🚀
