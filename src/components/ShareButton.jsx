import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import styles from './ShareButton.module.css';

export default function ShareButton({ title, text, url, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled share */
    }
  };

  return (
    <button type="button" className={`${styles.btn} ${className}`} onClick={handleShare} aria-label="Partager">
      {copied ? <Check size={18} /> : <Share2 size={18} />}
      <span>{copied ? 'Copié !' : 'Partager'}</span>
    </button>
  );
}
