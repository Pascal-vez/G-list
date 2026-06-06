import { X, ExternalLink, Navigation } from 'lucide-react';
import { getGoogleMapsEmbedUrl, getGoogleMapsDirectionsUrl, formatDistance } from '../utils/geo';
import styles from './MapModal.module.css';

export default function MapModal({ pro, userLocation, onClose }) {
  if (!pro) return null;

  const embedUrl = getGoogleMapsEmbedUrl(pro.lat, pro.lng);
  const directionsUrl = getGoogleMapsDirectionsUrl(
    pro.lat,
    pro.lng,
    userLocation?.lat,
    userLocation?.lng
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>{pro.nom}</h3>
            <p className={styles.address}>{pro.region} — {pro.quartier}</p>
            {pro.distance != null && (
              <p className={styles.distance}>
                <Navigation size={14} />
                À {formatDistance(pro.distance)} de vous
              </p>
            )}
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        <div className={styles.mapWrap}>
          <iframe
            title={`Carte — ${pro.nom}`}
            src={embedUrl}
            className={styles.map}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.directionsBtn}
        >
          <ExternalLink size={16} />
          Ouvrir dans Google Maps
        </a>
      </div>
    </div>
  );
}
