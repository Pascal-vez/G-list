import { SITE_CONTACT_EMAIL } from './constants';

export const FAQ_ITEM_IDS = [
  'what',
  'search',
  'register',
  'verified',
  'contactPro',
  'plans',
  'report',
  'contactTeam',
  'privacy',
];

/** Contenu FR pour le bot d'aide (UI via i18n) */
export const FAQ_ITEMS = [
  {
    q: "Qu'est-ce que G-List ?",
    a: "G-List est l'annuaire professionnel de référence en Guinée. Il permet de trouver et contacter des professionnels vérifiés par catégorie et par ville.",
  },
  {
    q: 'Comment rechercher un professionnel ?',
    a: "Utilisez la barre de recherche, parcourez les catégories ou filtrez par ville depuis l'annuaire. Vous pouvez aussi activer la géolocalisation pour trier par proximité.",
  },
  {
    q: 'Comment inscrire mon activité ?',
    a: 'Créez directement votre espace professionnel depuis « Espace pro ». Complétez votre profil, vos services et vos horaires.',
  },
  {
    q: 'Les profils sont-ils vérifiés ?',
    a: "Les profils portant le badge « Vérifié » ont été contrôlés par notre équipe. Vous pouvez filtrer l'annuaire pour n'afficher que les profils vérifiés.",
  },
  {
    q: 'Comment contacter un professionnel ?',
    a: 'Chaque fiche propose un bouton WhatsApp, le numéro de téléphone et, pour les comptes Premium, un formulaire de demande de devis.',
  },
  {
    q: 'Quels sont les plans pro (Free, Advanced, Premium) ?',
    a: 'Free inclut le profil de base. Advanced ajoute analytics et réponses aux avis. Premium débloque le CRM, le mini-site, les rapports et le classement par villes.',
  },
  {
    q: 'Comment signaler un profil ?',
    a: "Sur chaque fiche professionnelle, utilisez le bouton « Signaler » pour nous alerter en cas d'informations incorrectes ou de contenu inapproprié.",
  },
  {
    q: "Comment contacter l'équipe G-List ?",
    a: `Écrivez-nous à ${SITE_CONTACT_EMAIL}, via WhatsApp (+224 626 41 93 31) ou le formulaire sur la page Contact.`,
  },
  {
    q: 'Mes données sont-elles protégées ?',
    a: 'Consultez notre politique de confidentialité. Vous pouvez gérer vos cookies et demander la suppression de vos données à tout moment.',
  },
];
