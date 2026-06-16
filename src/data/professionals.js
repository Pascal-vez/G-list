import { getCoordinates } from './coordinates';
import { generateAllProfessionals } from './generateProfessionals';
import { enrichProfessional } from '../utils/proEnhancements';

const pros = generateAllProfessionals();

const professionals = pros.map((p) =>
  enrichProfessional({
    ...p,
    ...getCoordinates(p.region, p.quartier, p.id),
  }),
);

export default professionals;

export function getProfessionalById(id) {
  return professionals.find((p) => p.id === Number(id));
}
