#!/bin/bash

# This script is specifically for building the frontend on Vercel
echo "🚀 Starting Vercel frontend build..."

# Make sure we're in the frontend directory
cd "$(dirname "$0")" || exit

# Install all dependencies including dev dependencies
echo "📦 Installing dependencies (including dev dependencies)..."
npm install --include=dev

# Install the specific plugin that's causing issues
echo "📦 Installing @vitejs/plugin-react-swc specifically..."
npm install @vitejs/plugin-react-swc --save-dev

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# Print success message
echo "✅ Frontend build complete!" 