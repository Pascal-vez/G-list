import { REGIONS, CATEGORIES } from './constants.js';

const HORAIRES_BY_CATEGORY = {
  Pharmacies: ['Lun-Dim 7h-22h', 'Lun-Sam 7h30-21h'],
  'Restaurants & Maquis': ['Lun-Dim 11h-23h', 'Mar-Dim 12h-22h'],
  'Santé & Médecine': ['Lun-Ven 8h-17h', 'Lun-Sam 8h-16h'],
  Hôtels: ['Ouvert 24h/24, 7j/7'],
  Commerce: ['Lun-Sam 8h-20h', 'Lun-Dim 8h-19h'],
  'BTP & Construction': ['Lun-Sam 7h-17h'],
  'Coiffure & Beauté': ['Mar-Sam 9h-19h', 'Lun-Sam 8h30-18h30'],
};

const DEFAULT_HORAIRES_VARIANTS = ['Lun-Ven 8h-18h', 'Lun-Sam 8h-17h', 'Lun-Sam 9h-18h'];

const REVIEW_FIRST_NAMES = [
  'Mamadou', 'Fatoumata', 'Ibrahima', 'Aissatou', 'Moussa', 'Mariama', 'Ousmane', 'Kadiatou',
  'Amadou', 'Aminata', 'Abdoulaye', 'Hawa', 'Thierno', 'Safiatou', 'Seydou', 'Mariam',
  'Boubacar', 'Ramata', 'Alpha', 'Djenab',
];

const REVIEW_COMMENTS = [
  'Très professionnel, je recommande sans hésiter !',
  'Bon service, prix raisonnable. Reviendrai.',
  'Travail soigné et dans les délais. Satisfait.',
  'Personnel accueillant et compétent.',
  'Quelques délais mais résultat excellent.',
  'Rapport qualité-prix très correct pour Conakry.',
  'Sérieux et à l\'écoute. Bonne expérience.',
  'Intervention rapide et efficace, merci !',
  'Service correct, peut mieux faire sur la communication.',
  'Très bonne prestation, je recommande.',
  'Professionnel et ponctuel. Très satisfait.',
  'Bon accueil, travail bien fait.',
  'Prix un peu élevé mais qualité au rendez-vous.',
  'Équipe sympathique et efficace.',
  'Résultat conforme à mes attentes.',
  'Prestation correcte dans l\'ensemble, rien à redire.',
  'Accueil chaleureux et service rapide.',
  'Bon rapport qualité-prix pour le quartier.',
];

const REVIEW_RATINGS = [3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5];

const REVIEW_DATES = [
  '2025-01-12', '2025-02-08', '2025-03-19', '2025-04-03', '2025-05-27',
  '2025-06-14', '2025-07-22', '2025-08-05', '2025-09-30', '2025-10-18',
  '2025-11-07', '2025-12-21', '2026-01-09', '2026-02-16', '2026-03-04',
  '2026-03-28', '2026-04-11', '2026-04-25', '2026-05-02', '2026-05-19',
];

const FIRST_NAMES = [
  'Mamadou', 'Fatoumata', 'Ibrahima', 'Mariama', 'Oumar', 'Aissatou', 'Sékou', 'Kadiatou',
  'Alpha', 'Boubacar', 'Lansana', 'Thierno', 'Elhadj', 'Moussa', 'Ousmane', 'Sory', 'Yaya',
  'Aboubacar', 'Mohamed', 'Aminata', 'Fanta', 'Hawa', 'Lamine', 'Mory', 'Nana', 'Salif',
  'Toumany', 'Youssouf', 'Zalikatou', 'Bangaly', 'Cellou', 'Djibril', 'Fodé', 'Hadja',
];

const LAST_NAMES = [
  'Baldé', 'Diallo', 'Camara', 'Soumah', 'Kouyaté', 'Barry', 'Touré', 'Sylla', 'Konaté',
  'Bah', 'Condé', 'Sow', 'Keita', 'Conté', 'Doumbouya', 'Fofana', 'Sangaré', 'Cissé',
  'Traoré', 'Dansoko', 'Kaba', 'Souaré', 'Bangoura', 'Kourouma', 'Dabo', 'Sidibé',
];

const QUARTIERS = {
  Conakry: ['Ratoma', 'Kaloum', 'Matam', 'Dixinn', 'Matoto', 'Madina', 'Touquiwondy', 'Sonfonia'],
  Kindia: ['Centre', 'Damaro', 'Friguiadi', 'Mambiaïa'],
  Labé: ['Centre-ville', 'Hafia', 'Dar Es Salam', 'Popodara'],
  Mamou: ['Centre', 'Konkouré', 'Nyagara'],
  Kankan: ['Centre', 'Kabada', 'Missamana'],
  Faranah: ['Centre', 'Gnaléah', 'Banian'],
  'Nzérékoré': ['Centre', 'Palma', 'Womey'],
  Boké: ['Centre', 'Dabiss', 'Sangarédi'],
  Coyah: ['Centre', 'Kouriah', 'Manéah'],
  Fria: ['Centre', 'Tormelin'],
  Siguiri: ['Centre', 'Kintinian', 'Norassoba'],
  Guéckédou: ['Centre', 'Nongoa', 'Tekoulo'],
  Macenta: ['Centre', 'Kouankan', 'Sérédou'],
  Kissidougou: ['Centre', 'Albadaria', 'Yombiro'],
};

const CATEGORY_TEMPLATES = {
  'Santé & Médecine': {
    prefixes: ['Dr.', 'Dr.', 'Dr.', 'Cabinet', 'Clinique'],
    professions: ['Médecin généraliste', 'Pédiatre', 'Cardiologue', 'Gynécologue', 'Dentiste', 'Ophtalmologue', 'Chirurgien', 'Dermatologue', 'ORL', 'Kinésithérapeute'],
    specialites: [['Consultation', 'Urgences'], ['Nourrissons', 'Vaccination'], ['Cardiologie', 'ECG'], ['Grossesse', 'Gynécologie'], ['Soins dentaires', 'Prothèse']],
  },
  Pharmacies: {
    prefixes: ['Pharmacie'],
    professions: ['Pharmacie', 'Pharmacie', 'Pharmacie', 'Parapharmacie', 'Pharmacie de garde', 'Pharmacie vétérinaire', 'Pharmacie', 'Pharmacie', 'Pharmacie', 'Pharmacie'],
    specialites: [['Médicaments', 'Conseils'], ['Parapharmacie', 'Premiers soins'], ['Vaccins', 'Médicaments']],
  },
  'Juridique & Notariat': {
    prefixes: ['Cabinet', 'Maître', 'Maître', 'Étude', 'Cabinet'],
    professions: ['Avocat', 'Notaire', 'Huissier', 'Conseil juridique', 'Juriste', 'Avocat pénaliste', 'Avocat des affaires', 'Médiateur', 'Avocat', 'Notaire'],
    specialites: [['Droit civil', 'Contentieux'], ['Actes notariés', 'Immobilier'], ['Recouvrement', 'Signification']],
  },
  'BTP & Construction': {
    prefixes: ['Entreprise', 'BTP', 'Société', 'Groupe', 'Entreprise'],
    professions: ['Entrepreneur BTP', 'Bureau d\'études', 'Géomètre', 'Architecte', 'Ingénieur civil', 'Entrepreneur BTP', 'Charpentier métallique', 'Couvreur', 'Terrassier', 'Conducteur de travaux'],
    specialites: [['Gros œuvre', 'Terrassement'], ['Plans', 'Suivi chantier'], ['Construction', 'Rénovation']],
  },
  Plomberie: {
    prefixes: ['', '', 'Plomberie', '', ''],
    professions: ['Plombier', 'Plombier sanitaire', 'Plombier', 'Installateur sanitaire', 'Plombier', 'Plombier', 'Plombier', 'Plombier', 'Plombier', 'Plombier'],
    specialites: [['Installation', 'Dépannage'], ['Sanitaire', 'Tuyauterie'], ['Urgences', 'Entretien']],
  },
  Électricité: {
    prefixes: ['', 'Électricité', '', '', ''],
    professions: ['Électricien', 'Électricien industriel', 'Électricien', 'Électricien bâtiment', 'Électricien', 'Électricien', 'Électricien', 'Électricien', 'Électricien', 'Électricien'],
    specialites: [['Installation', 'Dépannage'], ['Industriel', 'Tableaux'], ['Câblage', 'Éclairage']],
  },
  Menuiserie: {
    prefixes: ['', 'Atelier', '', 'Menuiserie', ''],
    professions: ['Menuisier', 'Menuisier ébéniste', 'Menuisier', 'Charpentier bois', 'Menuisier', 'Menuisier', 'Menuisier', 'Menuisier', 'Menuisier', 'Menuisier'],
    specialites: [['Meubles', 'Portes'], ['Ébénisterie', 'Sur mesure'], ['Fenêtres', 'Agencement']],
  },
  Maçonnerie: {
    prefixes: ['', '', 'Entreprise', '', ''],
    professions: ['Maçon', 'Maçon', 'Chef de chantier', 'Carreleur', 'Maçon spécialisé', 'Maçon', 'Maçon', 'Maçon', 'Maçon', 'Maçon'],
    specialites: [['Construction', 'Rénovation'], ['Carrelage', 'Faïence'], ['Enduits', 'Finitions']],
  },
  'Peinture & Déco': {
    prefixes: ['', 'Peinture', '', '', 'Déco'],
    professions: ['Peintre', 'Peintre décorateur', 'Peintre en bâtiment', 'Décorateur intérieur', 'Peintre', 'Peintre', 'Peintre', 'Peintre', 'Peintre', 'Peintre'],
    specialites: [['Intérieur', 'Extérieur'], ['Décoration', 'Papier peint'], ['Ravalement', 'Finitions']],
  },
  'Restaurants & Maquis': {
    prefixes: ['Restaurant', 'Maquis', 'Restaurant', 'Maquis', 'Restaurant'],
    professions: ['Restaurant', 'Maquis', 'Restaurant', 'Maquis', 'Restaurant', 'Maquis', 'Restaurant', 'Maquis', 'Restaurant', 'Maquis'],
    specialites: [['Plats locaux', 'Grillades'], ['Riz gras', 'Poulet yassa'], ['Poisson', 'Cocktails']],
  },
  'Coiffure & Beauté': {
    prefixes: ['Salon', 'Institut', 'Salon', 'Coiffure', 'Salon'],
    professions: ['Salon de coiffure', 'Institut de beauté', 'Salon de coiffure', 'Barbier', 'Salon de coiffure', 'Institut de beauté', 'Salon de coiffure', 'Salon de coiffure', 'Salon de coiffure', 'Institut de beauté'],
    specialites: [['Tresses', 'Défrisage'], ['Coiffure', 'Manucure'], ['Coupe', 'Soins']],
  },
  'Photo & Vidéo': {
    prefixes: ['Studio', 'Photo', 'Studio', '', 'Vidéo'],
    professions: ['Photographe', 'Vidéaste', 'Photographe événementiel', 'Photographe portrait', 'Photographe', 'Vidéaste', 'Photographe', 'Photographe', 'Vidéaste', 'Photographe'],
    specialites: [['Mariages', 'Événements'], ['Portrait', 'Studio'], ['Vidéo', 'Montage']],
  },
  Hôtels: {
    prefixes: ['Hôtel', 'Résidence', 'Hôtel', 'Auberge', 'Hôtel'],
    professions: ['Hôtel', 'Hôtel', 'Résidence hôtelière', 'Auberge', 'Hôtel', 'Hôtel', 'Hôtel', 'Hôtel', 'Hôtel', 'Hôtel'],
    specialites: [['Hébergement', 'Restaurant'], ['Chambres', 'Séminaires'], ['Accueil', 'Room service']],
  },
  Commerce: {
    prefixes: ['Boutique', 'Magasin', 'Commerce', 'Shop', 'Boutique'],
    professions: ['Commerce général', 'Épicerie', 'Boutique de vêtements', 'Quincaillerie', 'Commerce', 'Boutique', 'Magasin', 'Commerce', 'Boutique', 'Commerce'],
    specialites: [['Vente', 'Livraison'], ['Alimentation', 'Produits locaux'], ['Textile', 'Accessoires']],
  },
  'Garage & Mécanique': {
    prefixes: ['Garage', 'Auto', 'Garage', 'Mécanique', 'Garage'],
    professions: ['Garage automobile', 'Mécanicien', 'Garage automobile', 'Mécanicien moto', 'Garage automobile', 'Garage automobile', 'Garage automobile', 'Mécanicien', 'Garage automobile', 'Garage automobile'],
    specialites: [['Vidange', 'Freins'], ['Moteur', 'Carrosserie'], ['Diagnostic', 'Entretien']],
  },
  'Informatique & Tech': {
    prefixes: ['', 'Techno', 'Alpha', 'Info', ''],
    professions: ['Réparation téléphones', 'Développeur web', 'Services informatiques', 'Technicien réseau', 'Réparation ordinateurs', 'Développeur web', 'Services informatiques', 'Réparation téléphones', 'Services informatiques', 'Développeur web'],
    specialites: [['Téléphones', 'Ordinateurs'], ['Sites web', 'Applications'], ['Réseaux', 'Maintenance']],
  },
  Éducation: {
    prefixes: ['Centre', 'École', 'Prof', 'Institut', 'Centre'],
    professions: ['École privée', 'Cours particuliers', 'Centre de formation', 'Professeur de maths', 'École privée', 'Cours particuliers', 'Centre de formation', 'Professeur de français', 'École privée', 'Cours particuliers'],
    specialites: [['Primaire', 'Collège'], ['Maths', 'Physique'], ['Formation pro', 'Langues']],
  },
  'Banques & Finance': {
    prefixes: ['Agence', 'Cabinet', 'Microfinance', 'Agence', 'Cabinet'],
    professions: ['Conseiller bancaire', 'Comptable', 'Agent microfinance', 'Expert-comptable', 'Conseiller bancaire', 'Comptable', 'Agent microfinance', 'Expert-comptable', 'Conseiller bancaire', 'Comptable'],
    specialites: [['Crédit', 'Épargne'], ['Comptabilité', 'Audit'], ['Microcrédit', 'Assurance']],
  },
  Transport: {
    prefixes: ['', 'Guinée', 'Taxi', 'Transport', ''],
    professions: ['Transport inter-villes', 'Service de taxi', 'Transport de marchandises', 'Location de véhicules', 'Transport inter-villes', 'Service de taxi', 'Transport inter-villes', 'Service de taxi', 'Transport de marchandises', 'Service de taxi'],
    specialites: [['Inter-villes', 'Colis'], ['Taxi urbain', 'Aéroport'], ['Fret', 'Logistique']],
  },
  Agriculture: {
    prefixes: ['Exploitation', 'Ferme', 'Coopérative', 'Agro', 'Exploitation'],
    professions: ['Agriculteur', 'Éleveur', 'Coopérative agricole', 'Producteur maraîcher', 'Agriculteur', 'Éleveur', 'Coopérative agricole', 'Producteur maraîcher', 'Agriculteur', 'Éleveur'],
    specialites: [['Cultures', 'Vente'], ['Élevage', 'Lait'], ['Maraîchage', 'Bio']],
  },
  Autre: {
    prefixes: ['', 'Atelier', '', 'Cabinet', ''],
    professions: ['Tailleur', 'Couturier', 'Agent immobilier', 'Traducteur', 'Nettoyage professionnel', 'Sécurité privée', 'Organisateur d\'événements', 'Coach sportif', 'Imprimeur', 'Réparateur électroménager'],
    specialites: [['Sur mesure', 'Retouches'], ['Vente', 'Location'], ['Traduction', 'Interprétariat']],
  },
};

function pick(arr, index) {
  return arr[index % arr.length];
}

function getHoraires(categoryName, id) {
  const variants = HORAIRES_BY_CATEGORY[categoryName] || DEFAULT_HORAIRES_VARIANTS;
  return pick(variants, id);
}

function generateAvis(id) {
  const count = 2 + (id % 4);
  const avis = [];

  for (let i = 0; i < count; i++) {
    const seed = id * 17 + i * 31;
    avis.push({
      prenom: pick(REVIEW_FIRST_NAMES, seed),
      note: pick(REVIEW_RATINGS, seed + 7),
      commentaire: pick(REVIEW_COMMENTS, seed + 11),
      date: pick(REVIEW_DATES, seed + 13),
    });
  }

  return avis;
}

function buildName(prefix, first, last, index) {
  if (prefix === 'Dr.' || prefix === 'Maître' || prefix === 'Prof') {
    return `${prefix} ${first} ${last}`;
  }
  if (prefix) {
    return `${prefix} ${last}${index > 0 ? ` ${index + 1}` : ''}`;
  }
  return `${first} ${last}`;
}

function generateListing(id, categoryName, index, regionOverride) {
  const tpl = CATEGORY_TEMPLATES[categoryName];
  const region = regionOverride || REGIONS[(index + id) % REGIONS.length];
  const quartiers = QUARTIERS[region] || ['Centre'];
  const quartier = pick(quartiers, index + id);
  const first = pick(FIRST_NAMES, id);
  const last = pick(LAST_NAMES, id + index);
  const prefix = pick(tpl.prefixes, index);
  const profession = pick(tpl.professions, index);
  const nom = buildName(prefix, first, last, index);
  const avis = generateAvis(id);
  const noteSum = avis.reduce((sum, review) => sum + review.note, 0);
  const note = Math.round((noteSum / avis.length) * 10) / 10;
  const verifie = (id + index) % 3 !== 0;

  return {
    id,
    nom,
    profession,
    categorie: categoryName,
    region,
    quartier,
    telephone: `+224622${String(id).padStart(6, '0')}`,
    note,
    nombreAvis: avis.length,
    verifie,
    description: `${profession} à ${quartier}, ${region}. Service professionnel et de qualité.`,
    specialites: pick(tpl.specialites, index),
    horaires: getHoraires(categoryName, id),
    avis,
  };
}

export function generateAllProfessionals() {
  const MIN_PER_CATEGORY = 10;
  const MIN_PER_REGION = 10;
  const listings = [];
  let id = 1;

  CATEGORIES.forEach((cat, catIndex) => {
    for (let i = 0; i < MIN_PER_CATEGORY; i++) {
      const region = REGIONS[(catIndex * MIN_PER_CATEGORY + i) % REGIONS.length];
      listings.push(generateListing(id++, cat.name, i, region));
    }
  });

  const regionCounts = {};
  REGIONS.forEach((r) => { regionCounts[r] = 0; });
  listings.forEach((p) => { regionCounts[p.region] += 1; });

  REGIONS.forEach((region) => {
    let deficit = MIN_PER_REGION - regionCounts[region];
    while (deficit > 0) {
      const cat = CATEGORIES[deficit % CATEGORIES.length];
      listings.push(generateListing(id++, cat.name, deficit, region));
      regionCounts[region] += 1;
      deficit -= 1;
    }
  });

  return listings;
}
