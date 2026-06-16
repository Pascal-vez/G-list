import { Link, Navigate } from 'react-router-dom';
import { X, ExternalLink } from 'lucide-react';
import { getProAccount, getMinisite } from '../utils/storage';
import { getMinisitePublicUrl } from '../utils/minisite';
import MinisiteRenderer from '../components/minisite/MinisiteRenderer';
import styles from './MiniSitePage.module.css';

export default function MiniSitePreviewPage() {
  const account = getProAccount();

  if (!account) {
    return <Navigate to="/espace-pro" replace />;
  }

  if (account.plan !== 'premium') {
    return <Navigate to="/espace-pro?tab=upgrade" replace />;
  }

  const site = getMinisite(account.id, account);
  const publicUrl = getMinisitePublicUrl(site.slug);

  return (
    <div className={styles.previewShell}>
      <header className={styles.previewBar}>
        <Link to="/espace-pro?tab=minisite" className={styles.exitPreview}>
          <X size={18} aria-hidden="true" />
          Quitter l&apos;aperçu
        </Link>
        <span className={styles.previewLabel}>Aperçu — sans branding G-List</span>
        <a href={publicUrl} target="_blank" rel="noopener noreferrer" className={styles.openPublic}>
          <ExternalLink size={14} aria-hidden="true" />
          Lien public
        </a>
      </header>
      <div className={styles.standalone}>
        <MinisiteRenderer site={site} pro={account} />
      </div>
    </div>
  );
}
