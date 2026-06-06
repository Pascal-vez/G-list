export const REGIONS = [
  'Conakry',
  'Kindia',
  'Labé',
  'Mamou',
  'Kankan',
  'Faranah',
  'Nzérékoré',
  'Boké',
  'Coyah',
  'Fria',
  'Siguiri',
  'Guéckédou',
  'Macenta',
  'Kissidougou',
];

export const CATEGORIES = [
  { id: 'sante', name: 'Santé & Médecine' },
  { id: 'pharmacies', name: 'Pharmacies' },
  { id: 'juridique', name: 'Juridique & Notariat' },
  { id: 'btp', name: 'BTP & Construction' },
  { id: 'plomberie', name: 'Plomberie' },
  { id: 'electricite', name: 'Électricité' },
  { id: 'menuiserie', name: 'Menuiserie' },
  { id: 'maconnerie', name: 'Maçonnerie' },
  { id: 'peinture', name: 'Peinture & Déco' },
  { id: 'restaurants', name: 'Restaurants & Maquis' },
  { id: 'coiffure', name: 'Coiffure & Beauté' },
  { id: 'photo', name: 'Photo & Vidéo' },
  { id: 'hotels', name: 'Hôtels' },
  { id: 'commerce', name: 'Commerce' },
  { id: 'garage', name: 'Garage & Mécanique' },
  { id: 'informatique', name: 'Informatique & Tech' },
  { id: 'education', name: 'Éducation' },
  { id: 'banques', name: 'Banques & Finance' },
  { id: 'transport', name: 'Transport' },
  { id: 'agriculture', name: 'Agriculture' },
  { id: 'autre', name: 'Autre' },
];

export const CATEGORY_DESCRIPTIONS = {
  sante: 'Médecins, cliniques et professionnels de santé pour prendre soin de vous et de votre famille.',
  pharmacies: 'Pharmacies, parapharmacies et points de vente de médicaments partout en Guinée.',
  juridique: 'Avocats, notaires et conseils juridiques pour vos démarches et litiges.',
  btp: 'Entrepreneurs, architectes et artisans du bâtiment pour vos projets de construction.',
  plomberie: 'Plombiers et installateurs sanitaires pour vos réparations et installations.',
  electricite: 'Électriciens qualifiés pour le dépannage, l\'installation et la mise aux normes.',
  menuiserie: 'Menuisiers et ébénistes pour meubles, portes, fenêtres et agencements sur mesure.',
  maconnerie: 'Maçons, carreleurs et chefs de chantier pour vos travaux de gros œuvre.',
  peinture: 'Peintres et décorateurs pour rénover et embellir vos intérieurs et façades.',
  restaurants: 'Restaurants, maquis et traiteurs pour savourer la gastronomie guinéenne.',
  coiffure: 'Salons de coiffure, barbiers et instituts de beauté près de chez vous.',
  photo: 'Photographes et vidéastes pour vos événements, portraits et projets visuels.',
  hotels: 'Hôtels, résidences et hébergements pour vos séjours en Guinée.',
  commerce: 'Commerces, boutiques et épiceries pour vos achats du quotidien.',
  garage: 'Garages et mécaniciens pour l\'entretien et la réparation de vos véhicules.',
  informatique: 'Techniciens, développeurs et services informatiques pour vos équipements.',
  education: 'Écoles, centres de formation et cours particuliers pour apprendre et progresser.',
  banques: 'Conseillers bancaires, comptables et experts en finance et microfinance.',
  transport: 'Taxis, transporteurs et services de location pour vos déplacements.',
  agriculture: 'Agriculteurs, éleveurs et coopératives pour vos besoins agricoles.',
  autre: 'Autres professionnels et services disponibles sur G-List.',
};

export function getCategoryById(id) {
  return CATEGORIES.find((cat) => cat.id === id) ?? null;
}

export const PROFESSIONS_BY_CATEGORY = {
  'Santé & Médecine': [
    'Médecin généraliste', 'Pédiatre', 'Cardiologue', 'Gynécologue', 'Dentiste',
    'Ophtalmologue', 'Chirurgien', 'Dermatologue', 'ORL', 'Kinésithérapeute', 'Infirmier',
  ],
  Pharmacies: [
    'Pharmacien', 'Parapharmacie', 'Pharmacie de garde', 'Pharmacie vétérinaire',
  ],
  'Juridique & Notariat': [
    'Avocat', 'Notaire', 'Huissier', 'Conseil juridique', 'Juriste', 'Médiateur',
  ],
  'BTP & Construction': [
    'Entrepreneur BTP', 'Architecte', 'Ingénieur civil', 'Géomètre', 'Charpentier métallique',
    'Couvreur', 'Terrassier', 'Conducteur de travaux',
  ],
  Plomberie: [
    'Plombier', 'Plombier sanitaire', 'Installateur sanitaire',
  ],
  Électricité: [
    'Électricien', 'Électricien industriel', 'Électricien bâtiment',
  ],
  Menuiserie: [
    'Menuisier', 'Menuisier ébéniste', 'Charpentier bois',
  ],
  Maçonnerie: [
    'Maçon', 'Chef de chantier', 'Carreleur', 'Maçon spécialisé',
  ],
  'Peinture & Déco': [
    'Peintre', 'Peintre décorateur', 'Décorateur intérieur',
  ],
  'Restaurants & Maquis': [
    'Restaurant', 'Maquis', 'Traiteur', 'Restauration rapide',
  ],
  'Coiffure & Beauté': [
    'Salon de coiffure', 'Institut de beauté', 'Barbier', 'Esthéticienne',
  ],
  'Photo & Vidéo': [
    'Photographe', 'Vidéaste', 'Photographe événementiel', 'Photographe portrait',
  ],
  Hôtels: [
    'Hôtel', 'Résidence hôtelière', 'Auberge', 'Hébergement',
  ],
  Commerce: [
    'Commerce général', 'Épicerie', 'Boutique de vêtements', 'Quincaillerie',
  ],
  'Garage & Mécanique': [
    'Garage automobile', 'Mécanicien', 'Mécanicien moto', 'Carrossier',
  ],
  'Informatique & Tech': [
    'Réparation téléphones', 'Développeur web', 'Services informatiques',
    'Technicien réseau', 'Réparation ordinateurs',
  ],
  Éducation: [
    'École privée', 'Cours particuliers', 'Centre de formation', 'Professeur',
  ],
  'Banques & Finance': [
    'Conseiller bancaire', 'Comptable', 'Agent microfinance', 'Expert-comptable',
  ],
  Transport: [
    'Transport inter-villes', 'Service de taxi', 'Transport de marchandises', 'Location de véhicules',
  ],
  Agriculture: [
    'Agriculteur', 'Éleveur', 'Coopérative agricole', 'Producteur maraîcher',
  ],
  Autre: [],
};

export const PROFESSION_OTHER = 'Autre';

export const ALL_PROFESSIONS = Object.entries(PROFESSIONS_BY_CATEGORY)
  .flatMap(([category, professions]) =>
    professions.map((label) => ({ label, category }))
  );

export const CATEGORY_COLORS = {
  'Santé & Médecine': '#E74C3C',
  Pharmacies: '#27AE60',
  'Juridique & Notariat': '#8E44AD',
  'BTP & Construction': '#D35400',
  Plomberie: '#2980B9',
  Électricité: '#F39C12',
  Menuiserie: '#795548',
  Maçonnerie: '#7F8C8D',
  'Peinture & Déco': '#E91E63',
  'Restaurants & Maquis': '#FF5722',
  'Coiffure & Beauté': '#9C27B0',
  'Photo & Vidéo': '#607D8B',
  Hôtels: '#3F51B5',
  Commerce: '#009688',
  'Garage & Mécanique': '#455A64',
  'Informatique & Tech': '#2196F3',
  Éducation: '#4CAF50',
  'Banques & Finance': '#1565C0',
  Transport: '#FF9800',
  Agriculture: '#689F38',
  Autre: '#9E9E9E',
};

export const DEFAULT_HORAIRES = 'Lun-Sam 8h-18h';

export const DEFAULT_AVIS = [
  { prenom: 'Mariam', note: 5, commentaire: 'Excellent service, très professionnel. Je recommande vivement !', date: '2026-03-15' },
  { prenom: 'Ousmane', note: 4, commentaire: 'Bon travail, ponctuel et à l\'écoute. Petit délai d\'attente mais satisfait.', date: '2026-02-28' },
  { prenom: 'Aminata', note: 5, commentaire: 'Très satisfaite du résultat. Prix correct pour la qualité offerte.', date: '2026-01-10' },
];
