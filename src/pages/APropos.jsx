import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import styles from '../components/InfoPageLayout.module.css';

const WHATSAPP_URL = 'https://wa.me/224626419331';

export default function APropos() {
  return (
    <InfoPageLayout
      title="À propos de G-List"
      subtitle="L'histoire derrière le projet"
      pageKey="apropos"
    >
      <InfoSection title="L'idée">
        <p>
          G-List est né d&apos;un constat simple : en Guinée, trouver un professionnel de confiance
          relève souvent du bouche-à-oreille. Un bon médecin, un électricien sérieux, un restaurant
          de qualité — ces informations existent, mais elles sont éparpillées, inaccessibles,
          invisibles. G-List a été créé pour changer ça.
        </p>
      </InfoSection>

      <InfoSection title="Notre mission">
        <p>
          Connecter chaque guinéen aux meilleurs professionnels de sa région — rapidement,
          simplement, en toute confiance. Que vous soyez à Conakry, Labé, Kankan ou Nzérékoré,
          G-List vous permet de trouver le bon professionnel en quelques secondes et de le
          contacter directement sur WhatsApp.
        </p>
      </InfoSection>

      <InfoSection title="Ce prototype">
        <p>
          La version que vous consultez actuellement est un prototype de validation. Toutes les
          informations affichées sont fictives. L&apos;objectif est de tester le concept auprès
          des utilisateurs guinéens avant le lancement officiel de la plateforme. Votre avis nous
          aide à construire la bonne solution pour la Guinée.
        </p>
      </InfoSection>

      <InfoSection title="Le créateur">
        <p>
          G-List est un projet entrepreneurial développé par un étudiant en informatique passionné
          par l&apos;impact technologique en Afrique de l&apos;Ouest. Le projet est né de la
          conviction que la technologie peut résoudre des problèmes concrets et quotidiens pour
          les guinéens.
        </p>
      </InfoSection>

      <InfoSection title="Nos valeurs">
        <div className={styles.cards}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Confiance</h3>
            <p className={styles.cardText}>
              Chaque professionnel vérifié porte un badge de validation. Les avis clients sont
              transparents et authentiques.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Local d&apos;abord</h3>
            <p className={styles.cardText}>
              G-List est conçu pour la réalité guinéenne — WhatsApp comme canal principal,
              interface légère adaptée à la 3G, disponible dans toutes les régions du pays.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Innovation africaine</h3>
            <p className={styles.cardText}>
              Nous croyons que les meilleures solutions pour l&apos;Afrique viennent d&apos;Afrique.
              G-List est fait par et pour les guinéens.
            </p>
          </div>
        </div>
      </InfoSection>

      <InfoSection title="Contact">
        <div className={styles.contactBlock}>
          <p>
            Une question ? Une suggestion ? Contactez-nous directement sur WhatsApp.
          </p>
          <a
            href={WHATSAPP_URL}
            className={styles.whatsappBtn}
            target="_blank"
            rel="noopener noreferrer"
          >
            Nous contacter sur WhatsApp
          </a>
        </div>
      </InfoSection>
    </InfoPageLayout>
  );
}
