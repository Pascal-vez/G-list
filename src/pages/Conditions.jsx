import { Link } from 'react-router-dom';
import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import infoStyles from '../components/InfoPageLayout.module.css';
import { SITE_CONTACT_EMAIL } from '../data/constants';
import SeoHead from '../components/SEO/SeoHead';

export default function Conditions() {
  return (
    <>
      <SeoHead
        titre="Conditions d'utilisation"
        description="Conditions générales d'utilisation de la plateforme G-List — annuaire professionnel en Guinée."
        url="/conditions"
      />
      <InfoPageLayout
        title="Conditions d'utilisation"
        subtitle="Dernière mise à jour : juin 2026 — Version 1.0"
        pageKey="conditions"
      >
        <p className={infoStyles.intro}>
          Les présentes conditions générales d&apos;utilisation (« CGU ») encadrent l&apos;accès et l&apos;usage du site
          G-List (g-list.gn) et des services associés. En créant un compte ou en naviguant sur la plateforme, vous
          acceptez l&apos;intégralité de ces conditions ainsi que notre{' '}
          <Link to="/confidentialite">politique de confidentialité</Link>.
        </p>

        <InfoSection title="1. Objet et description du service">
          <p>
            G-List est un annuaire professionnel en ligne dédié à la Guinée. La plateforme permet aux visiteurs de
            rechercher, comparer et contacter des professionnels par catégorie, ville ou mot-clé, et aux professionnels
            de publier une fiche, gérer leur visibilité et, selon leur plan, bénéficier de fonctionnalités avancées
            (statistiques, mini-site, réponses aux avis, etc.).
          </p>
          <p>
            G-List agit exclusivement en qualité d&apos;intermédiaire technique de mise en relation. Les prestations
            de services sont conclues et exécutées directement entre le visiteur et le professionnel concerné, hors
            contrôle de G-List.
          </p>
        </InfoSection>

        <InfoSection title="2. Accès au service et inscription">
          <p>L&apos;accès à l&apos;annuaire public est libre et gratuit. Certaines fonctionnalités nécessitent la création d&apos;un compte :</p>
          <ul>
            <li><strong>Compte visiteur</strong> — favoris, historique de consultation, avis, demandes de devis, notifications.</li>
            <li><strong>Compte professionnel</strong> — gestion de la fiche publique, services, photos, statistiques, abonnements et mini-site (plan Premium).</li>
          </ul>
          <p>
            Vous vous engagez à fournir des informations exactes, complètes et à jour. Toute fausse déclaration
            (identité, qualifications, coordonnées) peut entraîner la suspension ou la suppression du compte sans
            préavis ni indemnité.
          </p>
        </InfoSection>

        <InfoSection title="3. Comptes, sécurité et responsabilité">
          <p>
            Vous êtes seul responsable de la confidentialité de vos identifiants (email et mot de passe). Toute
            activité réalisée depuis votre compte est réputée effectuée par vous. En cas de suspicion d&apos;accès
            non autorisé, changez immédiatement votre mot de passe et contactez-nous à{' '}
            <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>.
          </p>
          <p>
            G-List met en œuvre des mesures de sécurité raisonnables (chiffrement des mots de passe, accès restreint,
            sauvegardes). Aucun système n&apos;étant infaillible, nous ne garantissons pas une sécurité absolue.
          </p>
        </InfoSection>

        <InfoSection title="4. Plans professionnels et fonctionnalités">
          <p>G-List propose plusieurs niveaux d&apos;abonnement pour les professionnels :</p>
          <ul>
            <li><strong>Free</strong> — fiche basique, visibilité standard dans l&apos;annuaire.</li>
            <li><strong>Advanced</strong> — fonctionnalités étendues (services, photos, statistiques, réponses aux avis).</li>
            <li><strong>Premium</strong> — visibilité renforcée, mini-site portfolio personnalisé, outils marketing et CRM simplifié.</li>
          </ul>
          <p>
            Les fonctionnalités disponibles, leurs limites (nombre de photos, de services, etc.) et les tarifs en vigueur
            sont décrits sur la page Tarifs et dans l&apos;espace pro au moment de la souscription. G-List se réserve le
            droit de faire évoluer les plans, sous réserve d&apos;informer les abonnés actifs avec un préavis raisonnable.
          </p>
        </InfoSection>

        <InfoSection title="5. Contenus publiés par les professionnels">
          <p>En publiant une fiche, des photos, un mini-site ou tout autre contenu, vous garantissez que :</p>
          <ul>
            <li>Les informations (nom, profession, tarifs, horaires, coordonnées) sont exactes et non trompeuses.</li>
            <li>Vous disposez des droits nécessaires sur les textes, images et médias publiés.</li>
            <li>Le contenu respecte la législation guinéenne et ne porte pas atteinte aux droits de tiers.</li>
            <li>Le contenu est exempt de propos haineux, diffamatoires, pornographiques, frauduleux ou illicites.</li>
          </ul>
          <p>
            Vous accordez à G-List une licence non exclusive, gratuite et mondiale pour héberger, reproduire et
            afficher vos contenus aux fins de fonctionnement et de promotion de la plateforme. Vous conservez la
            propriété de vos contenus.
          </p>
        </InfoSection>

        <InfoSection title="6. Mini-sites et liens externes">
          <p>
            Les professionnels Premium peuvent publier un mini-site accessible via une URL dédiée (ex. g-list.gn/pro/votre-nom).
            Le contenu du mini-site reste sous la responsabilité exclusive de son auteur. G-List peut retirer un
            mini-site non conforme ou non publié conformément à nos règles de modération.
          </p>
          <p>
            G-List peut contenir des liens vers des sites tiers (WhatsApp, réseaux sociaux, sites des professionnels).
            Nous ne sommes pas responsables du contenu ou des pratiques de ces sites externes.
          </p>
        </InfoSection>

        <InfoSection title="7. Avis, évaluations et signalements">
          <p>
            Les avis publiés sur G-List doivent refléter une expérience réelle avec le professionnel concerné.
            Sont interdits : les avis fictifs, rémunérés sans mention, les campagnes de dénigrement ou de
            promotion organisées, ainsi que tout contenu hors sujet.
          </p>
          <p>
            Les professionnels disposant d&apos;un plan Advanced ou Premium peuvent répondre publiquement aux avis.
            Tout utilisateur peut signaler un profil ou un contenu via le bouton « Signaler ». G-List examine les
            signalements et peut retirer un contenu, suspendre un compte ou fusionner des doublons sans obligation
            de motivation détaillée.
          </p>
        </InfoSection>

        <InfoSection title="8. Abonnements, facturation et paiements">
          <p>
            Les abonnements payants sont facturés en francs guinéens (GNF) aux tarifs affichés au moment de la commande.
            Les paiements peuvent être traités via mobile money (Orange Money, MTN MoMo) ou tout autre moyen proposé
            sur la plateforme, par l&apos;intermédiaire d&apos;un prestataire de paiement sécurisé.
          </p>
          <p>
            Sauf disposition légale impérative contraire, les sommes versées pour une période d&apos;abonnement déjà
            entamée ne sont pas remboursables. En cas de résiliation, l&apos;accès aux fonctionnalités payantes reste
            actif jusqu&apos;à la fin de la période souscrite, puis le compte repasse au plan Free.
          </p>
        </InfoSection>

        <InfoSection title="9. Comportements interdits">
          <p>Il est strictement interdit de :</p>
          <ul>
            <li>Usurper l&apos;identité d&apos;un tiers ou créer de faux profils professionnels.</li>
            <li>Extraire massivement des données (scraping) ou perturber le fonctionnement du site.</li>
            <li>Utiliser la plateforme à des fins de spam, harcèlement ou fraude.</li>
            <li>Contourner les limitations liées au plan d&apos;abonnement.</li>
            <li>Publier des contenus violant la propriété intellectuelle ou la vie privée d&apos;autrui.</li>
          </ul>
          <p>
            Tout manquement peut entraîner la suspension immédiate du compte, la suppression du contenu et, le cas
            échéant, des poursuites judiciaires.
          </p>
        </InfoSection>

        <InfoSection title="10. Disponibilité et évolutions du service">
          <p>
            G-List s&apos;efforce d&apos;assurer une disponibilité continue du service, mais n&apos;est tenue qu&apos;à
            une obligation de moyens. Des interruptions peuvent survenir (maintenance, mise à jour, force majeure).
            Nous nous réservons le droit de modifier, suspendre ou supprimer tout ou partie du service, avec information
            préalable lorsque cela est raisonnablement possible.
          </p>
        </InfoSection>

        <InfoSection title="11. Limitation de responsabilité">
          <p>
            G-List ne garantit ni la qualité, ni la disponibilité, ni le résultat des prestations fournies par les
            professionnels référencés. Les litiges relatifs à une prestation doivent être réglés directement entre le
            client et le professionnel.
          </p>
          <p>
            Dans les limites autorisées par la loi, la responsabilité de G-List est limitée au montant des sommes
            effectivement versées par l&apos;utilisateur au cours des douze (12) mois précédant le fait générateur
            du dommage, ou à cent mille (100 000) GNF si l&apos;utilisateur n&apos;est pas abonné payant.
          </p>
        </InfoSection>

        <InfoSection title="12. Résiliation">
          <p>
            Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre espace pro ou visiteur.
            G-List peut résilier ou suspendre un compte en cas de violation des présentes CGU, après signalement
            avéré ou sur demande d&apos;une autorité compétente.
          </p>
          <p>
            Les clauses relatives à la propriété intellectuelle, à la limitation de responsabilité et au droit applicable
            survivent à la résiliation.
          </p>
        </InfoSection>

        <InfoSection title="13. Droit applicable et litiges">
          <p>
            Les présentes CGU sont régies par le droit de la République de Guinée. En cas de différend, les parties
            s&apos;engagent à rechercher une solution amiable. À défaut d&apos;accord dans un délai de trente (30) jours,
            le litige sera porté devant les tribunaux compétents de Conakry, sous réserve des règles impératives
            de protection des consommateurs.
          </p>
        </InfoSection>

        <InfoSection title="14. Contact">
          <p>
            Pour toute question relative aux présentes conditions :<br />
            <strong>G-List</strong> — Conakry, Guinée<br />
            Email : <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a><br />
            WhatsApp : <a href="https://wa.me/224626419331">+224 626 41 93 31</a>
          </p>
          <p>
            Consultez également nos <Link to="/mentions-legales">mentions légales</Link> et notre{' '}
            <Link to="/confidentialite">politique de confidentialité</Link>.
          </p>
        </InfoSection>
      </InfoPageLayout>
    </>
  );
}
