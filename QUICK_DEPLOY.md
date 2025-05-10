# Quick Deployment Guide for ForgePhilippines

This guide provides step-by-step instructions to deploy your ForgePhilippines project to Vercel using the CLI.

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

## Step 3: Deploy to Vercel

Navigate to your project directory and run:

```bash
vercel
```

Follow the interactive prompts:

1. Set up and deploy? Select `y`.
2. Which scope? Select your team or personal account.
3. Link to existing project? Select `n` for the first deployment.
4. What's your project's name? Enter `forgephilippines` or any name you prefer.
5. In which directory is your code located? Press Enter for the current directory.
6. Override build settings? Select `y`.
7. Build Command: Enter `npm run build:full`.
8. Output Directory: Enter `frontend/dist`.
9. Development Command: Enter `npm run dev`.
10. Want to override the settings? Select `y`.
11. Want to add Environment Variables? Select `y` and add the required variables:
    - `MONGO_URI`
    - `JWT_SECRET`
    - `EMAIL_USER`
    - `EMAIL_PASS`
    - `NODE_ENV=production`

After deployment, you will get a URL like `https://forgephilippines.vercel.app`.

## Step 4: Update Environment Variables for Production

After your first deployment, update the environment variables with your new URL:

```bash
vercel env add FRONTEND_URL https://forgephilippines.vercel.app
vercel env add SOCKET_CORS_ORIGIN https://forgephilippines.vercel.app
vercel env add ALLOW_ORIGINS https://forgephilippines.vercel.app
```

## Step 5: Redeploy with Updated Variables

```bash
vercel --prod
```

## Step 6: Verify Deployment

Visit your deployment URL and test the application, including the API endpoints and real-time features.

## Deploying Updates

For future updates, simply push your changes to the repository and run:

```bash
vercel --prod
```

## Checking Logs

If you encounter issues, check the logs:

```bash
vercel logs forgephilippines
```