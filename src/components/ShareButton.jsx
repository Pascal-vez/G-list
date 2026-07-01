import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { useTranslation } from '../i18n/I18nContext';
import styles from './ShareButton.module.css';

export default function ShareButton({ title, text, url, className = '', label }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const displayLabel = label ?? t('share.label');

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
    <button
      type="button"
      className={className || styles.btn}
      onClick={handleShare}
      aria-label={t('share.label')}
    >
      {copied ? <Check size={18} /> : <Share2 size={18} />}
      <span>{copied ? t('share.copied') : displayLabel}</span>
    </button>
  );
}
