import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import { usePageMeta } from '../hooks/usePageMeta';
import { FAQ_ITEMS } from '../data/glistFaq';

export default function FAQ() {
  usePageMeta({
    title: 'FAQ',
    description: 'Questions fréquentes sur G-List — annuaire professionnel en Guinée.',
    path: '/faq',
  });

  return (
    <InfoPageLayout title="FAQ" subtitle="Questions fréquentes" pageKey="apropos">
      {FAQ_ITEMS.map(({ q, a }) => (
        <InfoSection key={q} title={q}>
          <p>{a}</p>
        </InfoSection>
      ))}
    </InfoPageLayout>
  );
}
