#!/bin/bash

# Main build script for ForgePhilippines on Vercel

echo "🚀 Starting ForgePhilippines build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build
cd ..

echo "✅ Build completed successfully!"