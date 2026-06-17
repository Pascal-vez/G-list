import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import SeoHead from '../components/SEO/SeoHead';
import { FAQ_ITEMS } from '../data/glistFaq';

export default function FAQ() {
  return (
    <>
      <SeoHead
        titre="FAQ"
        description="Questions fréquentes sur G-List — annuaire professionnel en Guinée."
        url="/faq"
      />
    <InfoPageLayout title="FAQ" subtitle="Questions fréquentes" pageKey="apropos">
      {FAQ_ITEMS.map(({ q, a }) => (
        <InfoSection key={q} title={q}>
          <p>{a}</p>
        </InfoSection>
      ))}
    </InfoPageLayout>
    </>
  );
}
