#!/bin/bash

# Exit on any error
set -e

echo "Starting Vercel build process..."

# Install all dependencies including dev dependencies
echo "Installing frontend dependencies..."
npm install --include=dev

# Ensure Vite plugins are installed explicitly
echo "Ensuring Vite plugins are installed..."
npm install @vitejs/plugin-react --save-dev

# Run the build
echo "Building frontend..."
npm run build

echo "Frontend build completed successfully." 