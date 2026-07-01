import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import { usePageMeta } from '../hooks/usePageMeta';
import { useTranslation } from '../i18n/I18nContext';
import { FAQ_ITEM_IDS } from '../data/glistFaq';
import { SITE_CONTACT_EMAIL } from '../data/constants';

export default function FAQ() {
  const { t } = useTranslation();
  usePageMeta({
    title: t('faq.title'),
    description: t('faq.meta.description'),
    path: '/faq',
  });

  return (
    <InfoPageLayout title={t('faq.title')} subtitle={t('faq.subtitle')} pageKey="apropos">
      {FAQ_ITEM_IDS.map((id) => (
        <InfoSection key={id} title={t(`faq.${id}.q`)}>
          <p>
            {t(`faq.${id}.a`, id === 'contactTeam' ? { email: SITE_CONTACT_EMAIL } : undefined)}
          </p>
        </InfoSection>
      ))}
    </InfoPageLayout>
  );
}
