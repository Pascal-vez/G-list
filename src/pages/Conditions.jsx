import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';

export default function Conditions() {
  return (
    <InfoPageLayout
      title="Conditions d'utilisation"
      subtitle="Juin 2026 — Version prototype"
      pageKey="conditions"
    >
      <InfoSection title="Nature du service">
        <p>
          G-List est actuellement un prototype de validation. La plateforme n&apos;est pas encore
          en production officielle. Toutes les informations affichées — professionnels, notes,
          avis, coordonnées — sont entièrement fictives et créées uniquement à des fins de test.
        </p>
      </InfoSection>

      <InfoSection title="Utilisation du prototype">
        <p>
          En accédant à G-List, vous acceptez que les informations affichées sont fictives, que le
          prototype est fourni à des fins d&apos;évaluation uniquement, qu&apos;aucune transaction
          réelle ne peut être effectuée via cette plateforme, et que les numéros WhatsApp affichés
          sont fictifs et non fonctionnels.
        </p>
      </InfoSection>

      <InfoSection title="Responsabilité">
        <p>
          G-List prototype est fourni tel quel, sans garantie d&apos;aucune sorte. Le créateur de
          G-List ne peut être tenu responsable d&apos;une quelconque décision prise sur la base
          des informations affichées dans ce prototype.
        </p>
      </InfoSection>

      <InfoSection title="Propriété intellectuelle">
        <p>
          Le nom G-List, le logo, le design et le concept de la plateforme sont la propriété
          exclusive de leur créateur. Toute reproduction, copie ou utilisation sans autorisation
          explicite est strictement interdite.
        </p>
      </InfoSection>

      <InfoSection title="Liste d'attente">
        <p>
          En rejoignant la liste d&apos;attente G-List, vous acceptez d&apos;être contacté sur
          WhatsApp lors du lancement officiel de la plateforme. Vous pouvez vous désinscrire à
          tout moment en nous contactant directement.
        </p>
      </InfoSection>

      <InfoSection title="Évolution des conditions">
        <p>
          Ces conditions seront remplacées par des conditions complètes lors du lancement officiel
          de G-List en République de Guinée.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
