import { useState, useEffect } from 'react';
import { LayoutGrid, Briefcase, PenLine } from 'lucide-react';
import {
  CATEGORIES, PROFESSIONS_BY_CATEGORY, PROFESSION_OTHER,
} from '../data/constants';
import CategoryIcon, { CATEGORY_COLORS } from './CategoryIcon';
import styles from './ProfessionSelect.module.css';

function getCategoryMeta(categoryName) {
  const cat = CATEGORIES.find((c) => c.name === categoryName);
  if (!cat) {
    return {
      id: null,
      accent: 'rgba(255, 152, 76, 0.15)',
      iconColor: '#FF984C',
    };
  }
  const palette = CATEGORY_COLORS[cat.id] || { bg: 'rgba(107, 114, 128, 0.12)', color: '#6B7280' };
  return { id: cat.id, accent: palette.bg, iconColor: palette.color };
}

function SelectField({ label, required, accent, iconColor, iconNode, children }) {
  return (
    <label className={styles.field}>
      <span className={styles.labelRow}>
        <span
          className={styles.labelIcon}
          style={{ background: accent, color: iconColor }}
          aria-hidden="true"
        >
          {iconNode}
        </span>
        {label}
        {required && <span className={styles.required}>*</span>}
      </span>
      {children}
    </label>
  );
}

export default function ProfessionSelect({
  category = '',
  profession = '',
  customProfession = '',
  onCategoryChange,
  onProfessionChange,
  onCustomProfessionChange,
  required = true,
  inputClassName = '',
}) {
  const [showCustom, setShowCustom] = useState(
    profession === PROFESSION_OTHER || (category === 'Autre' && !!customProfession)
  );

  useEffect(() => {
    setShowCustom(
      profession === PROFESSION_OTHER || (category === 'Autre' && !!customProfession)
    );
  }, [profession, category, customProfession]);

  const professions = category ? (PROFESSIONS_BY_CATEGORY[category] || []) : [];
  const categoryHasList = professions.length > 0;
  const categoryMeta = getCategoryMeta(category);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    onCategoryChange?.(value);
    onProfessionChange?.('');
    onCustomProfessionChange?.('');
    setShowCustom(value === 'Autre');
  };

  const handleProfessionChange = (e) => {
    const value = e.target.value;
    onProfessionChange?.(value);
    const isOther = value === PROFESSION_OTHER;
    setShowCustom(isOther);
    if (!isOther) onCustomProfessionChange?.('');
  };

  const selectClass = styles.select;

  return (
    <div className={styles.wrapper}>
      <SelectField
        label="Catégorie"
        required={required}
        accent={categoryMeta.accent}
        iconColor={categoryMeta.iconColor}
        iconNode={
          categoryMeta.id ? (
            <CategoryIcon id={categoryMeta.id} size={15} strokeWidth={2.2} />
          ) : (
            <LayoutGrid size={15} strokeWidth={2.2} />
          )
        }
      >
        <div className={styles.controlWrap}>
          <span
            className={styles.controlIcon}
            style={{ background: categoryMeta.accent, color: categoryMeta.iconColor }}
            aria-hidden="true"
          >
            {categoryMeta.id ? (
              <CategoryIcon id={categoryMeta.id} size={16} strokeWidth={2.2} />
            ) : (
              <LayoutGrid size={16} strokeWidth={2.2} />
            )}
          </span>
          <select
            value={category}
            onChange={handleCategoryChange}
            required={required}
            className={selectClass}
          >
            <option value="">Sélectionner une catégorie</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        {category && (
          <span className={styles.selectedHint}>
            {categoryMeta.id && (
              <CategoryIcon id={categoryMeta.id} size={14} strokeWidth={2.2} />
            )}
            {category}
          </span>
        )}
      </SelectField>

      {category && categoryHasList && (
        <SelectField
          label="Profession"
          required={required}
          accent="rgba(245, 197, 24, 0.15)"
          iconColor="#D4A800"
          iconNode={<Briefcase size={15} strokeWidth={2.2} />}
        >
          <div className={styles.controlWrap}>
            <span
              className={styles.controlIcon}
              style={{ background: 'rgba(245, 197, 24, 0.15)', color: '#D4A800' }}
              aria-hidden="true"
            >
              <Briefcase size={16} strokeWidth={2.2} />
            </span>
            <select
              value={profession}
              onChange={handleProfessionChange}
              required={required}
              className={selectClass}
            >
              <option value="">Sélectionner une profession</option>
              {professions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
              <option value={PROFESSION_OTHER}>{PROFESSION_OTHER}</option>
            </select>
          </div>
        </SelectField>
      )}

      {(showCustom || category === 'Autre') && (
        <SelectField
          label="Précisez votre profession"
          required={required}
          accent="rgba(171, 71, 188, 0.12)"
          iconColor="#AB47BC"
          iconNode={<PenLine size={15} strokeWidth={2.2} />}
        >
          <input
            type="text"
            value={customProfession}
            onChange={(e) => onCustomProfessionChange?.(e.target.value)}
            required={required}
            className={`${styles.input} ${inputClassName}`.trim()}
            placeholder="Ex: Agent de voyage, Bijoutier..."
          />
        </SelectField>
      )}
    </div>
  );
}

export function resolveProfessionValue(category, profession, customProfession) {
  if (category === 'Autre' || profession === PROFESSION_OTHER) {
    return customProfession.trim();
  }
  return profession || customProfession.trim();
}

export function professionToFormFields(account) {
  if (!account?.profession) {
    return { categorie: account?.categorie || '', profession: '', customProfession: '' };
  }
  const categorie = account.categorie || '';
  const list = PROFESSIONS_BY_CATEGORY[categorie] || [];
  if (list.includes(account.profession)) {
    return { categorie, profession: account.profession, customProfession: '' };
  }
  if (categorie === 'Autre') {
    return { categorie, profession: '', customProfession: account.profession };
  }
  return { categorie, profession: PROFESSION_OTHER, customProfession: account.profession };
}
