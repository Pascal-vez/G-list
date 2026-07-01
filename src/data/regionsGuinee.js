export const REGIONS_GUINEE = [
  {
    region: 'Conakry',
    prefectures: ['Conakry'],
  },
  {
    region: 'Kindia',
    prefectures: [
      'Kindia', 'Coyah', 'Dubréka',
      'Forécariah', 'Télimélé',
    ],
  },
  {
    region: 'Boké',
    prefectures: [
      'Boké', 'Boffa', 'Fria',
      'Gaoual', 'Koundara',
    ],
  },
  {
    region: 'Labé',
    prefectures: [
      'Labé', 'Koubia', 'Lélouma',
      'Mali', 'Tougué',
    ],
  },
  {
    region: 'Mamou',
    prefectures: [
      'Mamou', 'Dalaba', 'Pita',
    ],
  },
  {
    region: 'Faranah',
    prefectures: [
      'Faranah', 'Dabola', 'Dinguiraye',
      'Kissidougou',
    ],
  },
  {
    region: 'Kankan',
    prefectures: [
      'Kankan', 'Kérouané', 'Kouroussa',
      'Mandiana', 'Siguiri',
    ],
  },
  {
    region: 'Nzérékoré',
    prefectures: [
      'Nzérékoré', 'Beyla', 'Guéckédou',
      'Lola', 'Macenta', 'Yomou',
    ],
  },
];

export const TOUTES_PREFECTURES = REGIONS_GUINEE
  .flatMap((r) => r.prefectures)
  .sort((a, b) => a.localeCompare(b, 'fr'));
