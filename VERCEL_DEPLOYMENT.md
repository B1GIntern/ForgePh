# Deploying ForgePhilippines to Vercel

This guide will help you deploy your ForgePhilippines project to Vercel, hosting both the frontend and backend on a single Vercel deployment.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. [Git](https://git-scm.com/) installed on your computer
3. A MongoDB database (you can use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

## Step 1: Prepare Your Repository

Make sure your repository is pushed to GitHub, GitLab, or Bitbucket. Vercel can deploy directly from these repositories.

## Step 2: Set Up Environment Variables

Before deploying, you'll need to set up the following environment variables in Vercel:

1. `MONGO_URI`: Your MongoDB connection string
2. `JWT_SECRET`: A secret key for JWT authentication
3. `EMAIL_USER`: Email address for sending notifications
4. `EMAIL_PASS`: Password for the email account
5. `FRONTEND_URL`: Set to your Vercel deployment URL (after first deployment, you can update this)
6. `SOCKET_CORS_ORIGIN`: Same as FRONTEND_URL
7. `ALLOW_ORIGINS`: Same as FRONTEND_URL 
8. `NODE_ENV`: Set to `production`

## Step 3: Deploy to Vercel

1. Log in to your [Vercel dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your repository from GitHub, GitLab, or Bitbucket
4. In the configuration step:
   - Set the Framework Preset to "Other"
   - Root Directory: Leave empty to use the repository root
   - Build Command: Use `npm run build:full`
   - Output Directory: `frontend/dist`
5. Go to the "Environment Variables" section and add all the environment variables from Step 2
6. Click "Deploy"

## Step 4: Update Environment Variables (After First Deployment)

After the first deployment, you'll get a production URL from Vercel (e.g., `https://forgephilippines.vercel.app`).

1. Go to your Vercel project settings
2. Update the following environment variables:
   - `FRONTEND_URL`: Set to your Vercel deployment URL
   - `SOCKET_CORS_ORIGIN`: Same as FRONTEND_URL
   - `ALLOW_ORIGINS`: Same as FRONTEND_URL
3. Redeploy the application for these changes to take effect

## Step 5: Verify Your Deployment

1. Visit your Vercel deployment URL
2. Test the frontend application
3. Test the API endpoints using the `/api/*` routes
4. Verify that WebSockets are working for real-time features

## Troubleshooting

### Backend API Not Working

If your backend API is not working, check:

1. Vercel logs for any errors
2. MongoDB connection issues
3. Environment variables are correctly set
4. `vercel.config.json` file is properly configured

### Frontend Not Loading Assets

If the frontend assets are not loading:

1. Check the network requests in your browser's developer tools
2. Verify that the paths in `vercel.config.json` correctly point to your assets
3. Make sure the build process completed successfully

### WebSocket Connection Issues

If WebSockets are not connecting:

1. Check that the `SOCKET_CORS_ORIGIN` environment variable includes your deployment URL
2. Verify that the WebSocket routes in `vercel.config.json` are correctly configured
3. Check the browser console for any connection errors

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Deploying Node.js to Vercel](https://vercel.com/guides/deploying-nodejs-to-vercel)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)