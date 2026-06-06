import { Facebook, Instagram, Linkedin, Globe, ExternalLink } from 'lucide-react';
import styles from './SocialLinks.module.css';

function TikTokIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

const NETWORKS = [
  { key: 'facebook', label: 'Facebook', Icon: Facebook, color: '#1877F2' },
  { key: 'instagram', label: 'Instagram', Icon: Instagram, color: '#E4405F' },
  { key: 'tiktok', label: 'TikTok', Icon: TikTokIcon, color: '#FAFAFA' },
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin, color: '#0A66C2' },
  { key: 'portfolio', label: 'Portfolio', Icon: ExternalLink, color: '#F5C518' },
  { key: 'website', label: 'Site web', Icon: Globe, color: '#25D366' },
];

export default function SocialLinks({ social = {}, size = 'md' }) {
  const active = NETWORKS.filter((n) => social[n.key]?.trim());

  if (active.length === 0) return null;

  return (
    <div className={`${styles.row} ${styles[size]}`}>
      {active.map(({ key, label, Icon, color }) => (
        <a
          key={key}
          href={social[key].startsWith('http') ? social[key] : `https://${social[key]}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
          style={{ '--brand': color }}
          aria-label={label}
          title={label}
        >
          <Icon size={size === 'lg' ? 22 : 18} />
        </a>
      ))}
    </div>
  );
}

export { NETWORKS };
