# Fixed Vercel Deployment Guide for ForgePhilippines

This guide provides instructions for deploying your ForgePhilippines project to Vercel after fixing the dependency issues.

## What was Fixed

1. Created a proper `vercel.json` configuration
2. Added a dedicated `build.sh` script
3. Updated package.json scripts
4. Set up proper build configurations

## Important: Environment Variables

Your project uses several environment variables that need to be properly configured for Vercel deployment:

### Backend Environment Variables

These must be set in the Vercel dashboard:

```
# Database Connection
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_jwt_secret_here
SALT=10

# Email Service
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

# Server Configuration
PORT=10000
NODE_ENV=production
```

### CORS and Socket.io Configuration

After your first deployment, update these variables with your Vercel deployment URL:

```
# Replace "your-project.vercel.app" with your actual Vercel domain
FRONTEND_URL=https://your-project.vercel.app
SOCKET_CORS_ORIGIN=https://your-project.vercel.app
ALLOW_ORIGINS=https://your-project.vercel.app
```

## Deployment Steps

### 1. Push Your Changes to GitHub

Make sure all the changes we've made are pushed to your GitHub repository:

```bash
git add .
git commit -m "Fix Vercel deployment configuration"
git push
```

### 2. Deploy from the Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Keep all default settings (our vercel.json will handle the configuration)
   - Add all the environment variables listed above under "Backend Environment Variables"
5. Click "Deploy"

### 3. Update Environment Variables After Deployment

After you get your Vercel deployment URL (e.g., `https://forgephilippines.vercel.app`):

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add/update these additional variables with your actual Vercel URL:
   - `FRONTEND_URL`: Your Vercel deployment URL
   - `SOCKET_CORS_ORIGIN`: Your Vercel deployment URL
   - `ALLOW_ORIGINS`: Your Vercel deployment URL
4. Redeploy by clicking "Redeploy" in the Vercel dashboard

## Security Warning

The current repository contains `.env` files with sensitive information like database credentials and authentication secrets. These should be removed from version control:

1. Add `.env` and `.env.*` patterns to your `.gitignore` file
2. Create template `.env.example` files without actual sensitive values
3. Remove any existing `.env` files from your repository (after saving their contents)

## Troubleshooting

If you still encounter issues:

### For Missing Dependencies

Check the deployment logs. If you see errors like "Cannot find package X", you might need to:

1. Ensure all dependencies are listed in their respective package.json files
2. Check the build.sh script is being properly executed
3. Verify that the deployments are completing successfully

### For API Errors

If your API endpoints don't work:

1. Check that your backend server.js is correctly exporting the app
2. Verify the routes in vercel.json are correctly set up
3. Check that your MongoDB connection is working
4. Verify environment variables are correctly set in Vercel dashboard

### For WebSocket Issues

If WebSockets don't connect:

1. Ensure CORS settings are properly configured
2. Check that the socket.io route is properly configured in vercel.json
3. Make sure the URL in SOCKET_CORS_ORIGIN matches your actual deployment URL

## Alternative Deployment

If you continue to have issues with combined deployment, you can split your deployment:

1. Deploy the backend to Vercel as an API service
2. Deploy the frontend to Netlify or Vercel as a separate project
3. Configure the frontend to use the backend API URL 