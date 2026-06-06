const REGION_COORDS = {
  Conakry: { lat: 9.537, lng: -13.6785 },
  Kindia: { lat: 10.057, lng: -12.865 },
  Labé: { lat: 11.3182, lng: -12.2833 },
  Mamou: { lat: 10.5736, lng: -12.0678 },
  Kankan: { lat: 10.3854, lng: -9.3057 },
  Faranah: { lat: 10.0404, lng: -10.7439 },
  'Nzérékoré': { lat: 7.7562, lng: -8.8179 },
  Boké: { lat: 10.9322, lng: -14.2906 },
  Coyah: { lat: 9.7007, lng: -13.3817 },
  Fria: { lat: 10.3674, lng: -13.5823 },
  Siguiri: { lat: 11.4228, lng: -9.1685 },
  Guéckédou: { lat: 8.5644, lng: -10.1324 },
  Macenta: { lat: 8.5436, lng: -9.471 },
  Kissidougou: { lat: 9.1848, lng: -10.0997 },
};

const QUARTIER_OFFSETS = {
  Ratoma: { lat: 0.078, lng: 0.094 },
  Kaloum: { lat: -0.028, lng: -0.034 },
  Matam: { lat: 0.013, lng: 0.028 },
  Dixinn: { lat: 0.0, lng: 0.001 },
  Matoto: { lat: 0.046, lng: 0.078 },
  Madina: { lat: 0.023, lng: 0.048 },
  'Centre-ville': { lat: 0.005, lng: 0.003 },
  Centre: { lat: 0.004, lng: 0.002 },
  'Toute la ville': { lat: 0.01, lng: 0.01 },
};

export function getCoordinates(region, quartier, id) {
  const base = REGION_COORDS[region] || REGION_COORDS.Conakry;
  const offset = QUARTIER_OFFSETS[quartier] || { lat: 0, lng: 0 };
  const jitter = ((id % 7) - 3) * 0.003;
  return {
    lat: base.lat + offset.lat + jitter,
    lng: base.lng + offset.lng + jitter * 0.8,
  };
}
