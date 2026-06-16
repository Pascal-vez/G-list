import { useMemo, useState, useEffect } from 'react';
import { Download, Calendar, FileText } from 'lucide-react';
import {
  ADMIN_REPORT_SECTIONS,
  buildAdminReportPayload,
  exportAdminReport,
} from '../../utils/adminReport';
import { defaultDateRange, formatDateFR } from '../../utils/dateRange';
import styles from '../pro/ProReportGenerator.module.css';

const FORMATS = [
  { id: 'pdf', label: 'PDF' },
  { id: 'word', label: 'Word' },
  { id: 'excel', label: 'Excel' },
  { id: 'csv', label: 'CSV' },
];

export default function AdminReportGenerator({ dateRange }) {
  const [startDate, setStartDate] = useState(dateRange?.startDate || defaultDateRange().startDate);
  const [endDate, setEndDate] = useState(dateRange?.endDate || defaultDateRange().endDate);
  const [sections, setSections] = useState(() => ADMIN_REPORT_SECTIONS.map((s) => s.id));
  const [format, setFormat] = useState('pdf');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeAuthor, setIncludeAuthor] = useState(true);
  const [includeDate, setIncludeDate] = useState(true);
  const [title, setTitle] = useState('Rapport plateforme — G-List');
  const [subtitle, setSubtitle] = useState('Synthèse administration');

  useEffect(() => {
    if (!dateRange) return;
    setStartDate(dateRange.startDate);
    setEndDate(dateRange.endDate);
  }, [dateRange?.startDate, dateRange?.endDate]);

  const payload = useMemo(() => buildAdminReportPayload({
    startDate: formatDateFR(startDate),
    endDate: formatDateFR(endDate),
    startDateISO: startDate,
    endDateISO: endDate,
    sections,
    title,
    subtitle,
    includeLogo,
    includeAuthor,
    includeDate,
    author: 'Administration G-List',
  }), [startDate, endDate, sections, title, subtitle, includeLogo, includeAuthor, includeDate]);

  const toggleSection = (id) => {
    setSections((prev) => (
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    ));
  };

  const handleGenerate = () => {
    if (!sections.length) return;
    exportAdminReport(payload, format);
  };

  const { metrics, blocks } = payload;

  return (
    <div className={styles.page}>
      <div className={styles.metaBar}>
        <span className={styles.metaPill}>
          <Calendar size={14} aria-hidden="true" />
          {formatDateFR(startDate)} — {formatDateFR(endDate)}
        </span>
        <span className={styles.metaPill}>
          <FileText size={14} aria-hidden="true" />
          {sections.length} section{sections.length > 1 ? 's' : ''}
        </span>
        <span className={styles.metaPill}>
          Format : {FORMATS.find((f) => f.id === format)?.label}
        </span>
      </div>

      <div className={styles.layout}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Configuration</h2>
            <span>G-List · Admin</span>
          </div>
          <div className={styles.panelBody}>
            <div>
              <p className={styles.sectionTitle}>1 · Période d&apos;analyse</p>
              <div className={styles.dateRow}>
                <div className={styles.field}>
                  <label htmlFor="admin-report-start">Date de début</label>
                  <input
                    id="admin-report-start"
                    type="date"
                    value={startDate}
                    max={endDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="admin-report-end">Date de fin</label>
                  <input
                    id="admin-report-end"
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className={styles.contentHead}>
                <p className={styles.sectionTitle}>2 · Contenu du rapport</p>
                <div className={styles.formatGroup}>
                  <span className={styles.formatLabel}>Export</span>
                  {FORMATS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`${styles.formatBtn} ${format === f.id ? styles.formatBtnActive : ''}`}
                      onClick={() => setFormat(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.selectActions}>
                <button type="button" className={styles.linkBtn} onClick={() => setSections(ADMIN_REPORT_SECTIONS.map((s) => s.id))}>
                  Tout sélectionner
                </button>
                <button type="button" className={styles.linkBtn} onClick={() => setSections([])}>
                  Tout désélectionner
                </button>
              </div>
              <div className={styles.sectionGrid}>
                {ADMIN_REPORT_SECTIONS.map((section) => {
                  const checked = sections.includes(section.id);
                  return (
                    <label
                      key={section.id}
                      className={`${styles.sectionCard} ${checked ? styles.sectionCardChecked : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSection(section.id)}
                      />
                      <div>
                        <strong>{section.label}</strong>
                        <span>{section.description}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <p className={styles.sectionTitle}>3 · Personnalisation</p>
              <div className={styles.customGrid}>
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={includeLogo} onChange={(e) => setIncludeLogo(e.target.checked)} />
                  Logo G-List
                </label>
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={includeAuthor} onChange={(e) => setIncludeAuthor(e.target.checked)} />
                  Auteur du rapport
                </label>
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={includeDate} onChange={(e) => setIncludeDate(e.target.checked)} />
                  Date de génération
                </label>
                <div className={styles.field}>
                  <label htmlFor="admin-report-title">Titre du rapport</label>
                  <input id="admin-report-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="admin-report-subtitle">Sous-titre (optionnel)</label>
                  <input id="admin-report-subtitle" type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
                </div>
              </div>
            </div>

            <button
              type="button"
              className={styles.generateBtn}
              onClick={handleGenerate}
              disabled={!sections.length}
            >
              <Download size={18} aria-hidden="true" />
              Générer et télécharger le rapport
            </button>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Aperçu du rapport</h2>
            <span>{FORMATS.find((f) => f.id === format)?.label}</span>
          </div>
          <div className={styles.previewBody}>
            <div className={styles.previewDoc}>
              <div className={styles.previewHeader}>
                {includeLogo && (
                  <div className={styles.previewLogo}>
                    <span>G</span>-List
                  </div>
                )}
                <h3>{title}</h3>
                {subtitle && <p>{subtitle}</p>}
                <p>{formatDateFR(startDate)} — {formatDateFR(endDate)}</p>
              </div>

              {sections.includes('summary') && (
                <div className={styles.previewKpis}>
                  <div className={styles.previewKpi}>
                    <label>Professionnels</label>
                    <strong>{metrics.totalPros}</strong>
                    <small>+{metrics.growthPct}%</small>
                  </div>
                  <div className={styles.previewKpi}>
                    <label>Vues</label>
                    <strong>{metrics.totalViews}</strong>
                    <small>{metrics.totalSearches} recherches</small>
                  </div>
                  <div className={styles.previewKpi}>
                    <label>MRR</label>
                    <strong>{new Intl.NumberFormat('fr-GN').format(metrics.mrr)}</strong>
                    <small>GNF</small>
                  </div>
                </div>
              )}

              {blocks.map((block) => (
                <div key={block.title} className={styles.previewSection}>
                  <h4>{block.title}</h4>
                  {block.rows.map(([label, value]) => (
                    <div key={label} className={styles.previewRow}>
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
