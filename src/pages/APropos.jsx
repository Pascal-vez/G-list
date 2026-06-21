import { Link } from 'react-router-dom';
import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import { SITE_CONTACT_EMAIL } from '../data/constants';
import { usePageMeta } from '../hooks/usePageMeta';
import styles from '../components/InfoPageLayout.module.css';

const WHATSAPP_URL = 'https://wa.me/224626419331';

export default function APropos() {
  usePageMeta({
    title: 'À propos',
    description: 'Découvrez la mission de G-List — l\'annuaire professionnel de référence en Guinée.',
    path: '/a-propos',
  });

  return (
    <InfoPageLayout
      title="À propos de G-List"
      subtitle="L'annuaire professionnel de la Guinée"
      pageKey="apropos"
    >
      <InfoSection title="L'idée">
        <p>
          G-List est né d&apos;un constat simple : en Guinée, trouver un professionnel de confiance
          relève souvent du bouche-à-oreille. Un bon médecin, un électricien sérieux, un restaurant
          de qualité — ces informations existent, mais elles sont éparpillées. G-List centralise
          tout au même endroit.
        </p>
      </InfoSection>

      <InfoSection title="Notre mission">
        <p>
          Connecter chaque guinéen aux meilleurs professionnels de sa ville — rapidement,
          simplement, en toute confiance. Que vous soyez à Conakry, Labé, Kankan ou Nzérékoré,
          G-List vous permet de trouver le bon professionnel en quelques secondes et de le
          contacter directement sur WhatsApp.
        </p>
      </InfoSection>

      <InfoSection title="Comment ça marche ?">
        <div className={styles.cards}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Pour les visiteurs</h3>
            <p className={styles.cardText}>
              Recherchez par catégorie, ville ou mot-clé. Consultez les avis, la carte et les
              horaires. Contactez le pro par WhatsApp ou demandez un devis.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Pour les professionnels</h3>
            <p className={styles.cardText}>
              Créez votre espace pro, complétez votre fiche, gérez vos services et vos avis.
              Passez en Advanced ou Premium pour débloquer analytics, CRM et mini-site.
            </p>
          </div>
        </div>
      </InfoSection>

      <InfoSection title="Le créateur">
        <p>
          G-List est un projet entrepreneurial développé en Guinée, avec la conviction que la
          technologie peut résoudre des problèmes concrets et quotidiens pour les citoyens et
          les entreprises locales.
        </p>
      </InfoSection>

      <InfoSection title="Nos valeurs">
        <div className={styles.cards}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Confiance</h3>
            <p className={styles.cardText}>
              Profils vérifiés, avis transparents et modération active pour garantir la qualité
              de l&apos;annuaire.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Local d&apos;abord</h3>
            <p className={styles.cardText}>
              WhatsApp comme canal principal, interface légère adaptée à la 3G, couverture des
              14 villes couvertes.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Innovation africaine</h3>
            <p className={styles.cardText}>
              Une solution pensée par et pour les Guinéens, avec des tarifs en GNF et un support
              en français.
            </p>
          </div>
        </div>
      </InfoSection>

      <InfoSection title="Contact">
        <div className={styles.contactBlock}>
          <p>Une question, un partenariat ou une suggestion ? Écrivez-nous à{' '}
            <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>.
          </p>
          <div className={styles.contactActions}>
            <a href={WHATSAPP_URL} className={styles.whatsappBtn} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <Link to="/contact" className={styles.whatsappBtn} style={{ background: '#1A1A1A' }}>
              Formulaire de contact
            </Link>
          </div>
        </div>
      </InfoSection>
    </InfoPageLayout>
  );
}
