import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Conditions() {
  usePageMeta({
    title: 'Conditions d\'utilisation',
    description: 'Conditions générales d\'utilisation de la plateforme G-List.',
    path: '/conditions',
  });

  return (
    <InfoPageLayout
      title="Conditions d'utilisation"
      subtitle="Dernière mise à jour : juin 2026"
      pageKey="conditions"
    >
      <InfoSection title="1. Objet">
        <p>
          Les présentes conditions régissent l&apos;accès et l&apos;utilisation de G-List, annuaire professionnel
          permettant aux visiteurs de rechercher des professionnels en Guinée et aux professionnels de gérer leur présence en ligne.
        </p>
      </InfoSection>

      <InfoSection title="2. Comptes utilisateurs">
        <p>
          Les visiteurs peuvent créer un compte pour gérer favoris et historique. Les professionnels disposent d&apos;un
          espace dédié avec différents plans (Free, Advanced, Premium). Vous êtes responsable de la confidentialité de
          vos identifiants.
        </p>
      </InfoSection>

      <InfoSection title="3. Contenus publiés">
        <p>
          Les professionnels garantissent l&apos;exactitude des informations publiées (coordonnées, tarifs, qualifications).
          G-List se réserve le droit de modérer, suspendre ou supprimer tout contenu non conforme.
        </p>
      </InfoSection>

      <InfoSection title="4. Avis et signalements">
        <p>
          Les avis doivent être honnêtes et fondés sur une expérience réelle. Les utilisateurs peuvent signaler un profil
          via le bouton dédié. G-List examine les signalements et peut retirer des contenus abusifs.
        </p>
      </InfoSection>

      <InfoSection title="5. Abonnements et paiements">
        <p>
          Les plans payants sont facturés en GNF selon les tarifs affichés. Les paiements via mobile money seront traités
          par un prestataire sécurisé. Aucun remboursement n&apos;est dû pour la période entamée sauf disposition légale contraire.
        </p>
      </InfoSection>

      <InfoSection title="6. Responsabilité">
        <p>
          G-List est une plateforme de mise en relation. Les prestations sont fournies directement par les professionnels
          référencés. G-List ne saurait être tenu responsable des litiges entre utilisateurs et professionnels.
        </p>
      </InfoSection>

      <InfoSection title="7. Droit applicable">
        <p>
          Les présentes conditions sont régies par le droit guinéen. En cas de litige, les tribunaux de Conakry sont compétents.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
