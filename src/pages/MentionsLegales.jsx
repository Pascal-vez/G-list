import InfoPageLayout, { InfoSection } from '../components/InfoPageLayout';
import {
  SITE_CONTACT_EMAIL,
  SITE_LEGAL,
  formatLegalId,
} from '../data/constants';
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
          <strong>{SITE_LEGAL.entityName}</strong><br />
          {SITE_LEGAL.tagline}<br />
          Siège : {SITE_LEGAL.headquarters}<br />
          RCCM : {formatLegalId('RCCM', SITE_LEGAL.rc)}<br />
          NIF : {formatLegalId('NIF', SITE_LEGAL.nif)}<br />
          Email : <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a><br />
          WhatsApp : <a href={SITE_LEGAL.whatsappLink}>{SITE_LEGAL.whatsapp}</a>
        </p>
      </InfoSection>
      <InfoSection title="Directeur de la publication">
        <p>{SITE_LEGAL.publisherName}</p>
      </InfoSection>
      <InfoSection title="Hébergement">
        {SITE_LEGAL.hosts.map((host) => (
          <p key={host.name}>
            <strong>{host.role}</strong> — {host.name}<br />
            {host.address}
            {host.url ? (
              <>
                {' '}
                — <a href={host.url} target="_blank" rel="noopener noreferrer">{host.url.replace('https://', '')}</a>
              </>
            ) : null}
          </p>
        ))}
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
