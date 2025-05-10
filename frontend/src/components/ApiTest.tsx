import React, { useEffect, useState } from 'react';
import axiosInstance from '../config/axiosConfig';
import { API_BASE_URL } from '../config/api';

const ApiTest: React.FC = () => {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const testConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      // First, log the current API configuration
      console.log('Current API configuration:', {
        API_BASE_URL,
        envVars: {
          VITE_API_URL: import.meta.env.VITE_API_URL,
        }
      });
      
      // Try to connect to the test endpoint
      const response = await axiosInstance.get('/test');
      setResult(response.data);
      console.log('Test response:', response.data);
    } catch (err: any) {
      console.error('API test error:', err);
      setError(err.message || 'An error occurred connecting to the API');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 border border-gray-300 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">API Connection Test</h2>
      
      <div className="mb-4">
        <p><strong>API URL:</strong> {API_BASE_URL}</p>
        <p><strong>Environment:</strong> {import.meta.env.VITE_NODE_ENV || 'development'}</p>
      </div>
      
      <button 
        onClick={testConnection}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-md">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-md">
          <h3 className="font-bold">Success:</h3>
          <p>{result.message}</p>
          <p className="text-sm mt-2">Timestamp: {result.timestamp}</p>
          <div className="mt-2">
            <h4 className="font-bold">Headers:</h4>
            <ul className="text-sm">
              <li>Origin: {result.headers.origin}</li>
              <li>Referer: {result.headers.referer}</li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-sm">
        <p>To fix CORS issues:</p>
        <ol className="list-decimal ml-4">
          <li>Ensure your backend CORS configuration allows your frontend origin</li>
          <li>Check that the API URLs in your .env file are correct</li>
          <li>Try disabling withCredentials in the axiosConfig.ts file if using a different domain</li>
        </ol>
      </div>
    </div>
  );
};

export default ApiTest; 