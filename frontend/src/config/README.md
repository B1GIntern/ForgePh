# API Configuration

This directory contains centralized API configuration for the application.

## Files

### `api.ts`
Contains the base API URL configuration and a helper function for making direct fetch API calls.

### `axiosConfig.ts`
Implements a centralized axios instance with common configurations and interceptors.

## Usage

### Import the axios instance

```typescript
import axiosInstance from '../config/axiosConfig';
```

### Make API requests

```typescript
// GET request
const getData = async () => {
  try {
    const response = await axiosInstance.get('/endpoint');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// POST request
const postData = async (data) => {
  try {
    const response = await axiosInstance.post('/endpoint', data);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};
```

## Features

1. **Centralized Configuration**: All API request settings are configured in one place
2. **Authentication**: Automatically adds authentication tokens to requests
3. **Error Handling**: Common error handling for all API requests
4. **Logging**: Consistent error logging across the application

## Best Practices

1. Create service modules for related API endpoints
2. Use the axiosInstance for all API requests
3. Handle specific errors in the service modules when needed
4. Create typed interfaces for request and response data

## Debugging API Issues

If you encounter API connectivity issues, you can use the built-in debugging tools:

```typescript
import { runApiDiagnostics, debugAuth } from '../utils/apiDebugger';

// Log auth info to console
debugAuth();

// Run full diagnostics
const runDiagnostics = async () => {
  const results = await runApiDiagnostics();
  console.log(results);
};
```

### Common Issues

1. **CORS Errors**: Check if the API server has proper CORS headers enabled
2. **Authentication Failures**: Verify that the token is being properly stored and sent
3. **Network Connectivity**: Ensure the API server is reachable from the client
4. **Request Timeout**: The request may be taking too long to complete

### Diagnostic Functions

- `testApiConnection()`: Tests basic connectivity to the API
- `checkCorsIssues()`: Checks for CORS-related issues
- `checkAuthentication()`: Verifies authentication is working
- `runApiDiagnostics()`: Runs all diagnostics and returns a comprehensive report
- `debugAuth()`: Logs authentication info to console 