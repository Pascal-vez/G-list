import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import SeoHead from '../components/SEO/SeoHead';

export default function MentionsLegales() {
  return (
    <>
      <SeoHead
        titre="Mentions légales"
        description="Mentions légales du site G-List."
        url="/mentions-legales"
      />
    <InfoPageLayout title="Mentions légales" subtitle="Informations légales" pageKey="conditions">
      <InfoSection title="Éditeur du site">
        <p>
          <strong>G-List</strong><br />
          Annuaire professionnel — République de Guinée<br />
          Siège : Conakry, Guinée<br />
          Email : <a href="mailto:contact@g-list.gn">contact@g-list.gn</a><br />
          WhatsApp : +224 626 41 93 31
        </p>
      </InfoSection>
      <InfoSection title="Directeur de la publication">
        <p>Le responsable de la publication est le représentant légal de G-List.</p>
      </InfoSection>
      <InfoSection title="Hébergement">
        <p>
          Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
          L&apos;hébergeur peut être modifié lors du passage en production définitive.
        </p>
      </InfoSection>
      <InfoSection title="Propriété intellectuelle">
        <p>
          L&apos;ensemble du contenu du site (textes, graphismes, logo, structure) est protégé par le droit d&apos;auteur.
          Toute reproduction sans autorisation est interdite.
        </p>
      </InfoSection>
      <InfoSection title="Limitation de responsabilité">
        <p>
          G-List agit en tant qu&apos;intermédiaire de mise en relation. La responsabilité des prestations incombe
          aux professionnels référencés. G-List ne garantit pas l&apos;exactitude permanente des informations publiées.
        </p>
      </InfoSection>
    </InfoPageLayout>
    </>
  );
}
