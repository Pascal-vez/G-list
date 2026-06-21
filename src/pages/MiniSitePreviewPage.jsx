import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { X, ExternalLink } from 'lucide-react';
import {
  getProAccount, loadMinisiteForEditor, getProPlanLevel,
} from '../utils/storage';
import { getMinisitePublicUrl } from '../utils/minisite';
import MinisiteRenderer from '../components/minisite/MinisiteRenderer';
import styles from './MiniSitePage.module.css';

export default function MiniSitePreviewPage() {
  const account = getProAccount();

  const site = useMemo(() => {
    if (!account) return null;
    return loadMinisiteForEditor(account.id, account);
  }, [account]);

  if (!account) {
    return <Navigate to="/espace-pro" replace />;
  }

  if (getProPlanLevel(account) !== 'premium') {
    return <Navigate to="/espace-pro?tab=upgrade" replace />;
  }

  if (!site) {
    return <Navigate to="/espace-pro?tab=minisite" replace />;
  }

  const publicUrl = getMinisitePublicUrl(site.slug);

  return (
    <div className={styles.previewShell}>
      <header className={styles.previewBar}>
        <Link to="/espace-pro?tab=minisite" className={styles.exitPreview}>
          <X size={18} aria-hidden="true" />
          Quitter l&apos;aperçu
        </Link>
        <span className={styles.previewLabel}>
          Aperçu — {site.published === true ? 'publié' : 'brouillon (non visible publiquement)'}
        </span>
        {site.published === true ? (
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className={styles.openPublic}>
            <ExternalLink size={14} aria-hidden="true" />
            Lien public
          </a>
        ) : (
          <span className={styles.previewDraftHint}>Publiez pour activer le lien public</span>
        )}
      </header>
      <div className={styles.standalone}>
        <MinisiteRenderer site={site} pro={account} />
      </div>
    </div>
  );
}
