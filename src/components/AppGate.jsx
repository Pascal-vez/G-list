import { useState } from 'react';
import { isPrototypeAcknowledged } from '../utils/storage';
import PrototypeModal from './PrototypeModal';

export default function AppGate({ children }) {
  const [acknowledged, setAcknowledged] = useState(isPrototypeAcknowledged());

  if (!acknowledged) {
    return <PrototypeModal onAccept={() => setAcknowledged(true)} />;
  }

  return children;
}
