import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import { SITE_CONTACT_EMAIL } from '../data/constants';
import SeoHead from '../components/SEO/SeoHead';

export default function Cookies() {
  return (
    <>
      <SeoHead
        titre="Politique cookies"
        description="Politique d'utilisation des cookies sur G-List."
        url="/cookies"
      />
    <InfoPageLayout title="Politique cookies" subtitle="Dernière mise à jour : juin 2026" pageKey="confidentialite">
      <InfoSection title="Qu'est-ce qu'un cookie ?">
        <p>
          Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d&apos;un site web.
          Il permet de mémoriser des préférences et d&apos;améliorer votre expérience.
        </p>
      </InfoSection>
      <InfoSection title="Cookies utilisés par G-List">
        <ul>
          <li><strong>Cookies essentiels</strong> — session, préférences (mode sombre), consentement cookies.</li>
          <li><strong>Cookies de performance</strong> — mesure d&apos;audience anonymisée (uniquement si vous acceptez « Tout accepter »).</li>
          <li><strong>Cookies tiers</strong> — Google Fonts, cartes Google Maps sur les fiches pro (chargement à la demande).</li>
        </ul>
      </InfoSection>
      <InfoSection title="Gestion de vos préférences">
        <p>
          Lors de votre première visite, une bannière vous permet d&apos;accepter uniquement les cookies essentiels
          ou l&apos;ensemble des cookies. Vous pouvez modifier votre choix en vidant les données du site dans votre navigateur.
        </p>
      </InfoSection>
      <InfoSection title="Durée de conservation">
        <p>
          Les cookies essentiels sont conservés jusqu&apos;à 12 mois. Les cookies analytiques, le cas échéant,
          sont conservés jusqu&apos;à 13 mois conformément aux recommandations de la CNIL.
        </p>
      </InfoSection>
      <InfoSection title="Contact">
        <p>
          Pour toute question : <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a> ou WhatsApp +224 626 41 93 31.
        </p>
      </InfoSection>
    </InfoPageLayout>
    </>
  );
}
