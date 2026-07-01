import { Link } from 'react-router-dom';
import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import infoStyles from '../components/InfoPageLayout.module.css';
import { SITE_CONTACT_EMAIL, SITE_LEGAL } from '../data/constants';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Confidentialite() {
  usePageMeta({
    title: 'Politique de confidentialité',
    description: 'Comment G-List collecte, utilise, conserve et protège vos données personnelles.',
    path: '/confidentialite',
  });

  return (
    <InfoPageLayout
      title="Politique de confidentialité"
      subtitle="Dernière mise à jour : juin 2026 — Version 1.0"
      pageKey="confidentialite"
    >
      <p className={infoStyles.intro}>
        G-List s&apos;engage à protéger la vie privée de ses utilisateurs — visiteurs, professionnels et
        administrateurs. Cette politique décrit quelles données nous collectons, pourquoi, combien de temps nous
        les conservons et quels sont vos droits. Elle complète nos{' '}
        <Link to="/conditions">conditions d&apos;utilisation</Link>.
      </p>

      <InfoSection title="1. Responsable du traitement">
        <p>
          Le responsable du traitement des données personnelles collectées via g-list.gn est :
        </p>
        <p>
          <strong>{SITE_LEGAL.entityName}</strong><br />
          {SITE_LEGAL.tagline}<br />
          Siège : {SITE_LEGAL.headquarters}<br />
          Email : <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a><br />
          WhatsApp : <a href={SITE_LEGAL.whatsappLink}>{SITE_LEGAL.whatsapp}</a>
        </p>
        <p>
          Pour toute question relative à vos données personnelles, vous pouvez nous contacter aux coordonnées ci-dessus.
          Nous nous efforçons de répondre sous quinze (15) jours ouvrés.
        </p>
      </InfoSection>

      <InfoSection title="2. Données que nous collectons">
        <p>Selon votre usage de la plateforme, nous pouvons traiter les catégories de données suivantes :</p>

        <h3>Comptes visiteurs</h3>
        <ul>
          <li>Identité : prénom, nom, adresse email.</li>
          <li>Activité : favoris, historique de consultation, avis laissés, demandes de devis.</li>
          <li>Préférences : paramètres de notification, choix cookies.</li>
        </ul>

        <h3>Comptes professionnels</h3>
        <ul>
          <li>Identité et contact : nom ou raison sociale, email, téléphone, WhatsApp, région, quartier.</li>
          <li>Activité professionnelle : catégorie, métier, description, services, tarifs, horaires, photos, réseaux sociaux.</li>
          <li>Abonnement : plan souscrit (Free, Advanced, Premium), historique de facturation, transactions.</li>
          <li>Mini-site (Premium) : contenus publiés, slug, statistiques de visite, soumissions de formulaires.</li>
          <li>CRM et prospects : contacts saisis par le professionnel dans son espace.</li>
        </ul>

        <h3>Données techniques et de navigation</h3>
        <ul>
          <li>Adresse IP, type de navigateur, pages consultées, recherches effectuées (si cookies analytiques acceptés).</li>
          <li>Logs de sécurité, tentatives de connexion, journaux d&apos;audit administrateur.</li>
          <li>Données de géolocalisation approximative (si vous autorisez la localisation pour trier les résultats par distance).</li>
        </ul>

        <h3>Contenus générés par les utilisateurs</h3>
        <ul>
          <li>Avis et notes, réponses des professionnels, signalements, messages de contact et demandes de devis.</li>
        </ul>
      </InfoSection>

      <InfoSection title="3. Finalités et bases légales">
        <p>Nous utilisons vos données pour les finalités suivantes :</p>
        <ul>
          <li><strong>Fourniture du service</strong> — création de compte, publication de fiches, mise en relation visiteurs/pros (exécution du contrat).</li>
          <li><strong>Modération et sécurité</strong> — lutte contre la fraude, les faux profils et les contenus illicites (intérêt légitime).</li>
          <li><strong>Support client</strong> — réponse à vos demandes par email ou WhatsApp (intérêt légitime / contrat).</li>
          <li><strong>Facturation</strong> — gestion des abonnements et paiements mobile money (exécution du contrat, obligation légale).</li>
          <li><strong>Amélioration du service</strong> — statistiques agrégées et anonymisées sur l&apos;usage de la plateforme (intérêt légitime, sous réserve de votre consentement pour les cookies analytiques).</li>
          <li><strong>Communication</strong> — informations sur votre compte, mises à jour importantes (intérêt légitime). Pas de publicité non sollicitée sans consentement.</li>
          <li><strong>Obligations légales</strong> — réponse aux réquisitions des autorités compétentes.</li>
        </ul>
      </InfoSection>

      <InfoSection title="4. Données rendues publiques">
        <p>
          Les fiches professionnelles publiées dans l&apos;annuaire sont visibles par tout visiteur du site, y compris
          sans compte. Selon les paramètres du professionnel et son plan, peuvent être affichés : nom, métier, ville,
          téléphone, WhatsApp, description, photos, avis, horaires et lien vers le mini-site.
        </p>
        <p>
          En publiant une fiche ou un mini-site, le professionnel accepte cette visibilité publique. Les visiteurs
          peuvent contacter un professionnel via WhatsApp ou téléphone sans que G-List ne transmette leur numéro
          au professionnel, sauf en cas de demande de devis explicite.
        </p>
      </InfoSection>

      <InfoSection title="5. Destinataires et sous-traitants">
        <p>
          Vos données ne sont <strong>jamais vendues</strong> à des tiers à des fins publicitaires. Elles peuvent
          être transmises, dans la stricte limite de leurs missions, à nos prestataires techniques :
        </p>
        <ul>
          <li><strong>Hébergement</strong> — serveurs web et CDN (ex. Vercel).</li>
          <li><strong>Base de données</strong> — stockage sécurisé des comptes et mini-sites (ex. Supabase).</li>
          <li><strong>Emails transactionnels</strong> — envoi de liens de réinitialisation et vérification (ex. Resend).</li>
          <li><strong>Paiements</strong> — traitement des transactions mobile money via un prestataire certifié.</li>
        </ul>
        <p>
          Ces prestataires sont contractuellement tenus de protéger vos données et de ne les utiliser que pour
          les services qu&apos;ils nous fournissent. Certains peuvent être situés hors de Guinée ; dans ce cas,
          nous veillons à ce que des garanties appropriées soient en place.
        </p>
      </InfoSection>

      <InfoSection title="6. Durée de conservation">
        <ul>
          <li><strong>Compte actif</strong> — données conservées tant que le compte existe et que vous utilisez le service.</li>
          <li><strong>Compte supprimé</strong> — suppression ou anonymisation sous trente (30) jours, sauf obligations légales de conservation (facturation : jusqu&apos;à 5 ans).</li>
          <li><strong>Fiches professionnelles</strong> — conservées tant que le compte pro est actif ; retrait de l&apos;annuaire à la clôture du compte.</li>
          <li><strong>Avis et signalements</strong> — conservés le temps nécessaire à la modération et à la défense de nos intérêts en cas de litige.</li>
          <li><strong>Logs techniques</strong> — conservés au maximum douze (12) mois.</li>
          <li><strong>Cookies</strong> — durées détaillées sur notre <Link to="/cookies">politique cookies</Link>.</li>
        </ul>
      </InfoSection>

      <InfoSection title="7. Sécurité des données">
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles adaptées : chiffrement HTTPS,
          mots de passe hachés, accès restreints aux données, sauvegardes régulières, politiques de sécurité
          au niveau de la base de données (RLS). En cas de violation de données susceptible d&apos;engendrer
          un risque pour vos droits, nous vous en informerons dans les meilleurs délais conformément à la réglementation applicable.
        </p>
      </InfoSection>

      <InfoSection title="8. Vos droits">
        <p>Conformément à la réglementation applicable en République de Guinée et aux principes internationaux de protection des données, vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Droit d&apos;accès</strong> — obtenir une copie des données que nous détenons sur vous.</li>
          <li><strong>Droit de rectification</strong> — corriger des données inexactes ou incomplètes.</li>
          <li><strong>Droit à l&apos;effacement</strong> — demander la suppression de vos données (sous réserve des obligations légales).</li>
          <li><strong>Droit d&apos;opposition</strong> — vous opposer à certains traitements fondés sur l&apos;intérêt légitime.</li>
          <li><strong>Droit à la limitation</strong> — demander la suspension temporaire d&apos;un traitement.</li>
          <li><strong>Droit à la portabilité</strong> — recevoir vos données dans un format structuré (export disponible dans l&apos;espace pro Premium et visiteur).</li>
        </ul>
        <p>
          Pour exercer vos droits, écrivez à <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a> en précisant
          votre identité et la demande. Une pièce d&apos;identité peut être demandée en cas de doute sur l&apos;identité
          du demandeur. Vous pouvez également introduire une réclamation auprès de l&apos;autorité de protection
          des données compétente en Guinée, le cas échéant.
        </p>
      </InfoSection>

      <InfoSection title="9. Cookies et traceurs">
        <p>
          G-List utilise des cookies essentiels au fonctionnement du site (session, préférences, bannière cookies)
          et, avec votre consentement, des cookies analytiques pour mesurer l&apos;audience. Vous pouvez accepter,
          refuser ou modifier vos choix à tout moment via la bannière cookies ou la page dédiée.
        </p>
        <p>
          Consultez notre <Link to="/cookies">politique cookies</Link> pour le détail des traceurs utilisés,
          leurs finalités et leurs durées de conservation.
        </p>
      </InfoSection>

      <InfoSection title="10. Mineurs">
        <p>
          G-List n&apos;est pas destiné aux personnes de moins de seize (16) ans. Nous ne collectons pas
          sciemment de données concernant des mineurs. Si vous pensez qu&apos;un mineur nous a transmis des
          données, contactez-nous pour demander leur suppression.
        </p>
      </InfoSection>

      <InfoSection title="11. Modifications de cette politique">
        <p>
          Nous pouvons mettre à jour cette politique pour refléter l&apos;évolution de nos services ou de la
          réglementation. La date de dernière mise à jour figure en haut de page. En cas de modification substantielle,
          nous vous en informerons par email ou via une notification sur le site. La poursuite de l&apos;utilisation
          du service après notification vaut acceptation des nouvelles conditions, sauf opposition de votre part.
        </p>
      </InfoSection>

      <InfoSection title="12. Contact et réclamations">
        <p>
          Délégué à la protection des données / contact privacy :<br />
          <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a> — Objet : « Données personnelles »<br />
          WhatsApp : <a href="https://wa.me/224626419331">+224 626 41 93 31</a>
        </p>
        <p>
          Documents connexes : <Link to="/conditions">Conditions d&apos;utilisation</Link> ·{' '}
          <Link to="/mentions-legales">Mentions légales</Link> ·{' '}
          <Link to="/cookies">Politique cookies</Link>
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
