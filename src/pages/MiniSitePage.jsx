import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resolveMinisiteBySlug } from '../api/minisite';
import { incrementMinisiteView } from '../utils/storage';
import { buildJsonLd } from '../utils/minisite';
import SeoHead from '../components/SEO/SeoHead';
import MinisiteRenderer from '../components/minisite/MinisiteRenderer';
import styles from './MiniSitePage.module.css';

export default function MiniSitePage() {
  const { slug } = useParams();
  const resolved = resolveMinisiteBySlug(slug);

  useEffect(() => {
    if (resolved?.pro?.id) incrementMinisiteView(resolved.pro.id);
  }, [resolved?.pro?.id]);

  if (!resolved) {
    return (
      <>
        <SeoHead url={slug ? `/pro/${slug}` : undefined} />
        <div className={styles.notFound}>
          <h1>Site introuvable</h1>
          <p>Ce mini-site n&apos;existe pas ou n&apos;est pas encore publié.</p>
          <Link to="/annuaire" className={styles.backLink}>← Retour à l&apos;annuaire</Link>
        </div>
      </>
    );
  }

  const { site, pro } = resolved;

  return (
    <>
      <SeoHead
        titre={site?.seo?.title || pro?.nom}
        description={site?.seo?.description || `${pro.profession} — ${site.sections?.find((s) => s.type === 'hero')?.subtitle || ''}`}
        url={`/pro/${slug}`}
        type="website"
        image={site?.seo?.ogImage}
        jsonLd={buildJsonLd(site, pro)}
      />
      <div className={styles.standalone}>
        <MinisiteRenderer site={site} pro={pro} />
      </div>
    </>
  );
}
