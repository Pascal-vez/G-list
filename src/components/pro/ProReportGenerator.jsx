import { useMemo, useState, useEffect } from 'react';
import { Download, Calendar, FileText } from 'lucide-react';
import {
  REPORT_SECTIONS,
  buildReportPayload,
  exportReport,
} from '../../utils/proReport';
import { defaultDateRange, formatDateFR } from '../../utils/dateRange';
import styles from './ProReportGenerator.module.css';

const FORMATS = [
  { id: 'pdf', label: 'PDF' },
  { id: 'word', label: 'Word' },
  { id: 'excel', label: 'Excel' },
  { id: 'csv', label: 'CSV' },
];

function defaultStartDate() {
  return defaultDateRange().startDate;
}

function defaultEndDate() {
  return defaultDateRange().endDate;
}

export default function ProReportGenerator({ account, dateRange }) {
  const [startDate, setStartDate] = useState(dateRange?.startDate || defaultStartDate());
  const [endDate, setEndDate] = useState(dateRange?.endDate || defaultEndDate());
  const [sections, setSections] = useState(() => REPORT_SECTIONS.map((s) => s.id));
  const [format, setFormat] = useState('pdf');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeAdminName, setIncludeAdminName] = useState(true);
  const [includeDate, setIncludeDate] = useState(true);
  const [title, setTitle] = useState(`Rapport mensuel — ${account.nom}`);
  const [subtitle, setSubtitle] = useState('Performance sur G-List');

  useEffect(() => {
    if (!dateRange) return;
    setStartDate(dateRange.startDate);
    setEndDate(dateRange.endDate);
  }, [dateRange?.startDate, dateRange?.endDate]);

  const payload = useMemo(() => buildReportPayload(account, {
    startDate: formatDateFR(startDate),
    endDate: formatDateFR(endDate),
    sections,
    title,
    subtitle,
    includeLogo,
    includeAdminName,
    includeDate,
  }), [account, startDate, endDate, sections, title, subtitle, includeLogo, includeAdminName, includeDate]);

  const toggleSection = (id) => {
    setSections((prev) => (
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    ));
  };

  const handleGenerate = () => {
    if (!sections.length) return;
    exportReport(payload, format);
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
            <span>G-List · Export</span>
          </div>
          <div className={styles.panelBody}>
            <div>
              <p className={styles.sectionTitle}>1 · Période d&apos;analyse</p>
              <div className={styles.dateRow}>
                <div className={styles.field}>
                  <label htmlFor="report-start">Date de début</label>
                  <input
                    id="report-start"
                    type="date"
                    value={startDate}
                    max={endDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="report-end">Date de fin</label>
                  <input
                    id="report-end"
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
                <button type="button" className={styles.linkBtn} onClick={() => setSections(REPORT_SECTIONS.map((s) => s.id))}>
                  Tout sélectionner
                </button>
                <button type="button" className={styles.linkBtn} onClick={() => setSections([])}>
                  Tout désélectionner
                </button>
              </div>
              <div className={styles.sectionGrid}>
                {REPORT_SECTIONS.map((section) => {
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
                  <input type="checkbox" checked={includeAdminName} onChange={(e) => setIncludeAdminName(e.target.checked)} />
                  Nom du professionnel
                </label>
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={includeDate} onChange={(e) => setIncludeDate(e.target.checked)} />
                  Date de génération
                </label>
                <div className={styles.field}>
                  <label htmlFor="report-title">Titre du rapport</label>
                  <input id="report-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="report-subtitle">Sous-titre (optionnel)</label>
                  <input id="report-subtitle" type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
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
                    <label>Vues</label>
                    <strong>{metrics.views}</strong>
                    <small>{metrics.viewsTrend}</small>
                  </div>
                  <div className={styles.previewKpi}>
                    <label>WhatsApp</label>
                    <strong>{metrics.whatsappClicks}</strong>
                    <small>{metrics.whatsappTrend}</small>
                  </div>
                  <div className={styles.previewKpi}>
                    <label>Position</label>
                    <strong>#{metrics.categoryRank}</strong>
                    <small>{metrics.categoryName}</small>
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
