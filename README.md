# ForgePhilippines

A full-stack web application with React frontend and Node.js backend.

## Setup and Installation

### Prerequisites

- Node.js (v14 or newer)
- npm (v6 or newer)

### Quick Start

1. Clone the repository:
   ```
   git clone <repository-url>
   cd ForgePhilippines
   ```

2. Run the setup script to install all dependencies and create necessary environment files:
   ```
   npm run setup
   ```

3. Start the development server (both frontend and backend):
   ```
   npm run dev
   ```

The backend server will run on http://localhost:5001 and the frontend development server will run on http://localhost:8080.

## Available Scripts

In the project directory, you can run:

### `npm run setup`

Sets up the project by installing all dependencies and creating necessary environment files.

### `npm run dev`

Runs both the backend server and frontend development server concurrently.

### `npm run server`

Runs only the backend server with nodemon for automatic restarts on file changes.

### `npm run client`

Runs only the frontend development server.

### `npm run build`

Builds the frontend application for production deployment.

### `npm run build:full`

Installs all dependencies and then builds the frontend application.

### `npm run start`

Starts the production backend server.

## Deployment

This project is set up for easy deployment to various platforms:

### Vercel

Automatically configured through the `vercel-build` script.

### Heroku

Automatically configured through the `heroku-postbuild` script.

### Other Platforms

For other platforms, you typically need to:
1. Run `npm run build:full` to build the frontend
2. Start the backend server with `npm run start`

## Project Structure

- `/frontend` - React frontend application built with Vite
- `/backend` - Node.js backend server
- `/setup.js` - Project setup utility
- `/kill-port.js` - Utility for freeing up ports during development