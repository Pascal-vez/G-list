import { useState, useEffect, useMemo, useId } from 'react';
import { TOUTES_PREFECTURES } from '../data/regionsGuinee';
import {
  fetchLocalitesPersonnalisees,
  upsertLocalitePersonnalisee,
  incrementerUtilisationLocalite,
} from '../api/localites';
import {
  estPrefectureOfficielle,
  normaliserLocalite,
  titreLocalite,
} from '../utils/localite';
import styles from './LocaliteInput.module.css';

export default function LocaliteInput({
  value,
  onChange,
  placeholder = 'Rechercher ou saisir une localité…',
  className = '',
  inputClassName = '',
  required = false,
  id: idProp,
  name,
  trackUsage = false,
  onLocaliteSelected,
}) {
  const autoId = useId();
  const inputId = idProp || autoId;
  const [saisie, setSaisie] = useState(value || '');
  const [ouvert, setOuvert] = useState(false);
  const [localitesPerso, setLocalitesPerso] = useState([]);

  useEffect(() => {
    setSaisie(value || '');
  }, [value]);

  useEffect(() => {
    let cancelled = false;
    fetchLocalitesPersonnalisees(50).then((noms) => {
      if (!cancelled) setLocalitesPerso(noms);
    });
    return () => { cancelled = true; };
  }, []);

  const toutesOptions = useMemo(() => {
    const set = new Set([...TOUTES_PREFECTURES, ...localitesPerso]);
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [localitesPerso]);

  const suggestions = useMemo(() => {
    if (!saisie.trim()) return toutesOptions.slice(0, 12);
    const q = normaliserLocalite(saisie);
    return toutesOptions
      .filter((loc) => normaliserLocalite(loc).includes(q))
      .slice(0, 12);
  }, [saisie, toutesOptions]);

  const existeExactement = toutesOptions.some(
    (loc) => normaliserLocalite(loc) === normaliserLocalite(saisie),
  );

  const appliquerSelection = async (loc, { persister = false } = {}) => {
    const nomPropre = titreLocalite(loc);
    if (!nomPropre) return;

    setSaisie(nomPropre);
    onChange?.(nomPropre);
    setOuvert(false);

    if (persister && !estPrefectureOfficielle(nomPropre)) {
      const res = await upsertLocalitePersonnalisee(nomPropre);
      if (res?.ok) {
        setLocalitesPerso((prev) => (
          prev.includes(nomPropre) ? prev : [nomPropre, ...prev]
        ));
      }
    }

    if (trackUsage && !estPrefectureOfficielle(nomPropre)) {
      await incrementerUtilisationLocalite(nomPropre);
    }

    onLocaliteSelected?.(nomPropre);
  };

  const selectionner = (loc) => appliquerSelection(loc, { persister: false });

  const ajouterNouvelleLocalite = () => {
    appliquerSelection(saisie, { persister: true });
  };

  const handleBlur = () => {
    setTimeout(() => setOuvert(false), 150);
    const trimmed = saisie.trim();
    if (trimmed && normaliserLocalite(trimmed) !== normaliserLocalite(value)) {
      if (existeExactement) {
        const exact = toutesOptions.find(
          (loc) => normaliserLocalite(loc) === normaliserLocalite(trimmed),
        );
        if (exact) selectionner(exact);
      }
    }
  };

  return (
    <div className={`${styles.wrap} ${className}`.trim()}>
      <input
        id={inputId}
        name={name}
        type="text"
        value={saisie}
        placeholder={placeholder}
        required={required}
        className={`${styles.input} ${inputClassName}`.trim()}
        autoComplete="address-level2"
        onChange={(e) => {
          setSaisie(e.target.value);
          setOuvert(true);
        }}
        onFocus={() => setOuvert(true)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && saisie.trim() && !existeExactement) {
            e.preventDefault();
            ajouterNouvelleLocalite();
          }
        }}
      />

      {ouvert && (
        <div className={styles.listeSuggestions} role="listbox">
          {suggestions.map((loc) => (
            <div
              key={loc}
              role="option"
              className={`${styles.suggestionItem} ${
                estPrefectureOfficielle(loc)
                  ? styles.suggestionItemOfficielle
                  : styles.suggestionItemPerso
              }`}
              onMouseDown={() => selectionner(loc)}
            >
              {loc}
              {!estPrefectureOfficielle(loc) && (
                <span style={{ opacity: 0.55, fontSize: '0.85em' }}> · communauté</span>
              )}
            </div>
          ))}

          {saisie.trim() && !existeExactement && (
            <div
              role="option"
              className={`${styles.suggestionItem} ${styles.ajouterNouvelle}`}
              onMouseDown={ajouterNouvelleLocalite}
            >
              {`+ Ajouter « ${saisie.trim()} » comme nouvelle localité`}
            </div>
          )}

          {suggestions.length === 0 && !saisie.trim() && (
            <div className={styles.suggestionVide}>Commencez à taper…</div>
          )}
        </div>
      )}
    </div>
  );
}
