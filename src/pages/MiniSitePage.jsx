import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resolveMinisiteBySlug } from '../api/minisite';
import { incrementMinisiteView } from '../utils/storage';
import { buildJsonLd } from '../utils/minisite';
import { usePageMeta } from '../hooks/usePageMeta';
import MinisiteRenderer from '../components/minisite/MinisiteRenderer';
import styles from './MiniSitePage.module.css';

export default function MiniSitePage() {
  const { slug } = useParams();
  const resolved = resolveMinisiteBySlug(slug);

  useEffect(() => {
    if (resolved?.pro?.id) incrementMinisiteView(resolved.pro.id);
  }, [resolved?.pro?.id]);

  usePageMeta({
    title: resolved?.site?.seo?.title || resolved?.pro?.nom,
    description: resolved?.site?.seo?.description || (resolved ? `${resolved.pro.profession} — ${resolved.site.sections?.find((s) => s.type === 'hero')?.subtitle || ''}` : undefined),
    path: resolved ? `/pro/${slug}` : undefined,
    type: 'website',
    image: resolved?.site?.seo?.ogImage,
  });

  if (!resolved) {
    return (
      <div className={styles.notFound}>
        <h1>Site introuvable</h1>
        <p>Ce mini-site n&apos;existe pas ou n&apos;est pas encore publié.</p>
        <Link to="/annuaire" className={styles.backLink}>← Retour à l&apos;annuaire</Link>
      </div>
    );
  }

  const { site, pro } = resolved;

  return (
    <div className={styles.standalone}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(site, pro)) }} />
      <MinisiteRenderer site={site} pro={pro} />
    </div>
  );
}
