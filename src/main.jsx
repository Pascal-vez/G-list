import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { isDarkMode } from './utils/storage';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/typography.css';
import './index.css';
import App from './App.jsx';

if (isDarkMode()) {
  document.documentElement.classList.add('dark-mode');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
