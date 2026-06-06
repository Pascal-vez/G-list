import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';

export default function Confidentialite() {
  return (
    <InfoPageLayout
      title="Politique de confidentialité"
      subtitle="Juin 2026 — Version prototype"
      pageKey="confidentialite"
    >
      <InfoSection title="Contexte">
        <p>
          G-List est actuellement en phase de prototype de validation. Cette politique décrit
          comment nous traitons les données collectées durant cette phase de test.
        </p>
      </InfoSection>

      <InfoSection title="Données collectées">
        <p>
          Durant cette phase prototype, G-List collecte uniquement les données que vous fournissez
          volontairement : nom, profession, région et numéro WhatsApp si vous rejoignez la liste
          d&apos;attente, vos avis et évaluations sur la plateforme, et vos réponses aux questions
          de feedback. Aucune donnée de navigation, aucun cookie de tracking, aucune donnée
          personnelle n&apos;est collectée sans votre consentement explicite.
        </p>
      </InfoSection>

      <InfoSection title="Stockage">
        <p>
          Toutes les données de ce prototype sont stockées localement dans votre navigateur via
          localStorage. Elles ne sont pas transmises à un serveur externe et restent sur votre
          appareil uniquement.
        </p>
      </InfoSection>

      <InfoSection title="Utilisation">
        <p>
          Les données collectées sont utilisées exclusivement pour améliorer le prototype avant
          le lancement, comprendre les besoins des utilisateurs guinéens, et contacter les inscrits
          à la liste d&apos;attente lors du lancement officiel. Vos données ne sont jamais vendues,
          partagées ou transmises à des tiers.
        </p>
      </InfoSection>

      <InfoSection title="Vos droits">
        <p>
          Vous pouvez à tout moment effacer vos données en vidant le localStorage de votre
          navigateur, demander la suppression de vos données en nous contactant sur WhatsApp,
          et retirer votre consentement à tout moment sans justification.
        </p>
      </InfoSection>

      <InfoSection title="Évolution">
        <p>
          Cette politique sera mise à jour lors du lancement officiel de G-List avec un traitement
          des données conforme aux réglementations en vigueur en République de Guinée.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
