import { createContext, useCallback, useContext, useState } from 'react';
import EvaluationModal from '../components/EvaluationModal';

const EvaluationContext = createContext(null);

export function EvaluationProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <EvaluationContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      <EvaluationModal open={isOpen} onClose={closeModal} />
    </EvaluationContext.Provider>
  );
}

export function useEvaluation() {
  const ctx = useContext(EvaluationContext);
  if (!ctx) {
    throw new Error('useEvaluation must be used within EvaluationProvider');
  }
  return ctx;
}
