import { Link } from 'react-router-dom';
import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import { SITE_CONTACT_EMAIL } from '../data/constants';
import { usePageMeta } from '../hooks/usePageMeta';
import { useTranslation } from '../i18n/I18nContext';
import styles from '../components/InfoPageLayout.module.css';

const WHATSAPP_URL = 'https://wa.me/224626419331';

export default function APropos() {
  const { t } = useTranslation();
  usePageMeta({
    title: t('about.meta.title'),
    description: t('about.meta.description'),
    path: '/a-propos',
  });

  return (
    <InfoPageLayout
      title={t('about.title')}
      subtitle={t('about.subtitle')}
      pageKey="apropos"
    >
      <InfoSection title={t('about.idea.title')}>
        <p>{t('about.idea.body')}</p>
      </InfoSection>

      <InfoSection title={t('about.mission.title')}>
        <p>{t('about.mission.body')}</p>
      </InfoSection>

      <InfoSection title={t('about.how.title')}>
        <div className={styles.cards}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t('about.how.visitors.title')}</h3>
            <p className={styles.cardText}>{t('about.how.visitors.body')}</p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t('about.how.pros.title')}</h3>
            <p className={styles.cardText}>{t('about.how.pros.body')}</p>
          </div>
        </div>
      </InfoSection>

      <InfoSection title={t('about.creator.title')}>
        <p>{t('about.creator.body')}</p>
      </InfoSection>

      <InfoSection title={t('about.values.title')}>
        <div className={styles.cards}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t('about.values.trust.title')}</h3>
            <p className={styles.cardText}>{t('about.values.trust.body')}</p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t('about.values.local.title')}</h3>
            <p className={styles.cardText}>{t('about.values.local.body')}</p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t('about.values.innovation.title')}</h3>
            <p className={styles.cardText}>{t('about.values.innovation.body')}</p>
          </div>
        </div>
      </InfoSection>

      <InfoSection title={t('about.contact.title')}>
        <div className={styles.contactBlock}>
          <p>{t('about.contact.body')}{' '}
            <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>.
          </p>
          <div className={styles.contactActions}>
            <a href={WHATSAPP_URL} className={styles.whatsappBtn} target="_blank" rel="noopener noreferrer">
              {t('about.contact.whatsapp')}
            </a>
            <Link to="/contact" className={styles.whatsappBtn} style={{ background: '#1A1A1A' }}>
              {t('about.contact.formLink')}
            </Link>
          </div>
        </div>
      </InfoSection>
    </InfoPageLayout>
  );
}
