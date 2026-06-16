import { Link } from 'react-router-dom';
import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Confidentialite() {
  usePageMeta({
    title: 'Politique de confidentialité',
    description: 'Comment G-List collecte, utilise et protège vos données personnelles.',
    path: '/confidentialite',
  });

  return (
    <InfoPageLayout
      title="Politique de confidentialité"
      subtitle="Dernière mise à jour : juin 2026"
      pageKey="confidentialite"
    >
      <InfoSection title="1. Responsable du traitement">
        <p>
          G-List, annuaire professionnel basé à Conakry (Guinée), est responsable du traitement des données
          personnelles collectées via le site g-list.gn et l&apos;application associée.
        </p>
      </InfoSection>

      <InfoSection title="2. Données collectées">
        <p>Nous pouvons collecter :</p>
        <ul>
          <li>Identité et coordonnées (nom, email, téléphone, WhatsApp)</li>
          <li>Informations professionnelles (activité, ville, services, horaires)</li>
          <li>Données de navigation (pages visitées, recherches) si vous acceptez les cookies analytiques</li>
          <li>Avis, messages, demandes de devis et signalements</li>
        </ul>
      </InfoSection>

      <InfoSection title="3. Finalités">
        <p>Les données sont utilisées pour :</p>
        <ul>
          <li>Publier et gérer les fiches professionnelles</li>
          <li>Mettre en relation visiteurs et professionnels</li>
          <li>Assurer la modération, la sécurité et le support client</li>
          <li>Améliorer le service et produire des statistiques agrégées</li>
          <li>Respecter nos obligations légales</li>
        </ul>
      </InfoSection>

      <InfoSection title="4. Base légale & conservation">
        <p>
          Le traitement repose sur votre consentement, l&apos;exécution du contrat (compte pro) ou notre intérêt légitime
          (sécurité du service). Les données sont conservées tant que le compte est actif, puis archivées selon les
          durées légales applicables en République de Guinée.
        </p>
      </InfoSection>

      <InfoSection title="5. Partage des données">
        <p>
          Vos données ne sont pas vendues. Elles peuvent être partagées avec nos sous-traitants techniques (hébergement,
          paiement mobile) dans la stricte limite de leurs missions. Les fiches professionnelles publiques sont visibles
          par tous les visiteurs du site.
        </p>
      </InfoSection>

      <InfoSection title="6. Vos droits">
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression, de limitation et d&apos;opposition.
          Contact : <a href="mailto:contact@g-list.gn">contact@g-list.gn</a> ou WhatsApp +224 626 41 93 31.
        </p>
      </InfoSection>

      <InfoSection title="7. Cookies">
        <p>
          Consultez notre <Link to="/cookies">politique cookies</Link> pour gérer vos préférences.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
