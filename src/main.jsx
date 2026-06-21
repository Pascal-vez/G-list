import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from './components/ErrorBoundary';
import { rebuildMinisitePublishedIndex } from './utils/storage';
import './styles/typography.css';
import './index.css';
import App from './App.jsx';

rebuildMinisitePublishedIndex();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
