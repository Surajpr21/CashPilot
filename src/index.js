import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import AuthProfileBootstrap from './providers/AuthProfileBootstrap';
import './index.css';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ProfileProvider>
        <AuthProvider>
          <AuthProfileBootstrap>
            <App />
          </AuthProfileBootstrap>
        </AuthProvider>
      </ProfileProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
