import { getCoordinates } from './coordinates';
import { generateAllProfessionals } from './generateProfessionals';

const pros = generateAllProfessionals();

const professionals = pros.map((p) => ({
  ...p,
  ...getCoordinates(p.region, p.quartier, p.id),
}));

export default professionals;

export function getProfessionalById(id) {
  return professionals.find((p) => p.id === Number(id));
}
