import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Plus, GripVertical, Eye, Trash2, Copy, Check,
  ChevronDown, ExternalLink, Save, ToggleLeft, ToggleRight,
  Layout, Palette, Search, Smartphone, Monitor, CopyPlus, Sparkles,
  FileStack, BarChart3, Code2, Download, Upload, Wand2, History, Plug, QrCode,
} from 'lucide-react';
import {
  SECTION_TYPES, createSection, reorderSections, slugify,
  getMinisitePublicUrl, MINISITE_LEVEL, SITE_TEMPLATES, FONT_PRESETS,
  applyTemplate, duplicateSection, getSitePages, syncSitePages,
  updatePageInSite, addPageToSite, removePageFromSite,
  exportMinisiteJson, importMinisiteJson, THEME_PRESETS, LEVEL_CHANGELOG,
  getAllSiteTemplates, LEVEL_MILESTONES, generateAIContent, createSiteSnapshot,
} from '../../utils/minisite';
import { saveMinisite, isSlugAvailable, getMinisite, getMinisiteAnalytics, getMinisiteFormSubmissions } from '../../utils/storage';
import MinisiteRenderer from './MinisiteRenderer';
import { SectionEditor, SectionStyleEditor, DropZone } from './MinisiteSectionEditors';
import styles from './MinisiteEditor.module.css';

export default function MinisiteEditor({ account }) {
  const navigate = useNavigate();
  const [site, setSite] = useState(() => syncSitePages(getMinisite(account.id, account)));
  const [activePageId, setActivePageId] = useState('home');
  const [activeId, setActiveId] = useState(() => getSitePages(syncSitePages(getMinisite(account.id, account)))[0]?.sections[0]?.id);
  const [editorTab, setEditorTab] = useState('content');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [slugError, setSlugError] = useState('');
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [templateApplied, setTemplateApplied] = useState('');

  const pages = getSitePages(site);
  const activePage = pages.find((p) => p.id === activePageId) || pages[0];
  const sections = activePage?.sections || site.sections || [];
  const analytics = getMinisiteAnalytics(account.id);
  const formSubmissions = getMinisiteFormSubmissions(account.id);

  const activeSection = sections.find((s) => s.id === activeId);
  const publicUrl = getMinisitePublicUrl(site.slug);

  // Resynchroniser la section active si l'id est invalide (données migrées, changement de modèle…)
  useEffect(() => {
    if (!sections.length) {
      if (activeId) setActiveId(null);
      return;
    }
    if (!sections.some((s) => s.id === activeId)) {
      setActiveId(sections[0].id);
      setEditorTab('content');
    }
  }, [sections, activeId]);

  const persist = (nextSite) => {
    const synced = syncSitePages(nextSite);
    saveMinisite(account.id, synced, account);
    setSite(synced);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSite = (patch) => setSite((prev) => syncSitePages({ ...prev, ...patch }));

  const setPageSections = (newSections) => {
    setSite((prev) => updatePageInSite(prev, activePageId, { sections: newSections }));
  };

  const updateSection = (id, data) => {
    setPageSections(sections.map((s) => (s.id === id ? data : s)));
  };

  const handleSlugChange = (val) => {
    const s = slugify(val);
    setSlugError(!isSlugAvailable(s, account.id) ? 'Ce lien est déjà pris' : '');
    updateSite({ slug: s });
  };

  const handleSave = () => { if (!slugError) persist(site); };
  const handlePreview = () => { persist(site); navigate('/espace-pro/apercu-minisite'); };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addSection = (type) => {
    const sec = createSection(type);
    const nextSections = [...sections, sec];
    setPageSections(nextSections);
    setActiveId(sec.id);
    setShowAddMenu(false);
    setEditorTab('content');
  };

  const dupSection = (id) => {
    const sec = sections.find((s) => s.id === id);
    if (!sec) return;
    const copy = duplicateSection(sec);
    const idx = sections.findIndex((s) => s.id === id);
    const next = [...sections];
    next.splice(idx + 1, 0, copy);
    setPageSections(next);
    setActiveId(copy.id);
  };

  const removeSection = (id) => {
    if (sections.length <= 1) return;
    const next = sections.filter((s) => s.id !== id);
    if (activeId === id) setActiveId(next[0]?.id);
    setPageSections(next);
  };

  const applySiteTemplate = (templateId) => {
    const tpl = getAllSiteTemplates()[templateId];
    if (!tpl) return;
    if (site.templateId === templateId) return;

    const freshTemplate = site.templateId !== templateId;
    const next = applyTemplate(templateId, account, site, { freshTemplate, resetContent: false });
    const synced = syncSitePages(next);
    const homeSections = synced.sections || [];

    setSite(synced);
    setActivePageId('home');
    setActiveId(homeSections[0]?.id);
    setEditorTab('content');
    persist(synced);
    setTemplateApplied(tpl.label);
    setTimeout(() => setTemplateApplied(''), 3000);
  };

  const onDragStart = (index) => setDragIndex(index);
  const onDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setSite((prev) => updatePageInSite(prev, activePageId, { sections: reorderSections(sections, dragIndex, index) }));
    setDragIndex(index);
  };
  const onDragEnd = () => setDragIndex(null);

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Globe size={18} aria-hidden="true" />
          <div>
            <strong>Studio mini-site</strong>
            <span className={styles.levelBadge}>Niveau {site.level || MINISITE_LEVEL}</span>
            <span className={styles.levelHintUltra}>Enterprise</span>
          </div>
        </div>
        <div className={styles.toolbarCenter}>
          <span className={styles.urlPrefix}>glist.gn/pro/</span>
          <input value={site.slug} onChange={(e) => handleSlugChange(e.target.value)} className={styles.slugInput} />
          <button type="button" onClick={handleCopyLink} className={styles.iconBtn} title="Copier">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className={styles.iconBtn} title="Ouvrir"><ExternalLink size={16} /></a>
        </div>
        <div className={styles.toolbarRight}>
          <button type="button" className={styles.publishToggle} onClick={() => updateSite({ published: !site.published })}>
            {site.published ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            {site.published ? 'Publié' : 'Brouillon'}
          </button>
          <button type="button" onClick={handlePreview} className={styles.previewBtn}><Eye size={16} /> Aperçu</button>
          <button type="button" onClick={handleSave} className={styles.saveBtn} disabled={!!slugError}><Save size={16} /> {saved ? 'OK' : 'Sauvegarder'}</button>
        </div>
      </div>

      {slugError && <p className={styles.slugError}>{slugError}</p>}

      <div className={styles.templateRow}>
        <Sparkles size={16} aria-hidden="true" />
        <span>Modèles :</span>
        <div className={styles.templateScroll}>
          {Object.entries(getAllSiteTemplates()).map(([id, tpl]) => (
            <button
              key={id}
              type="button"
              title={tpl.description}
              className={`${styles.templateBtn} ${site.templateId === id ? styles.templateBtnActive : ''}`}
              onClick={() => applySiteTemplate(id)}
            >
              {tpl.label}
            </button>
          ))}
        </div>
        {templateApplied && (
          <span className={styles.templateApplied}>✓ Modèle « {templateApplied} » appliqué</span>
        )}
      </div>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHead}>
            <h3><FileStack size={14} /> Pages</h3>
            <button type="button" className={styles.addSectionBtn} onClick={() => { const next = addPageToSite(site); setSite(next); const p = next.pages[next.pages.length - 1]; setActivePageId(p.id); setActiveId(p.sections[0]?.id); }}>
              <Plus size={14} /> Page
            </button>
          </div>
          <ul className={styles.pageList}>
            {pages.map((p) => (
              <li key={p.id}>
                <button type="button" className={`${styles.pageItem} ${activePageId === p.id ? styles.pageItemActive : ''}`} onClick={() => { setActivePageId(p.id); setActiveId(p.sections[0]?.id); }}>
                  {p.label}
                </button>
                {p.id !== 'home' && (
                  <button type="button" className={styles.pageRemove} onClick={() => { const next = removePageFromSite(site, p.id); setSite(next); setActivePageId('home'); }} aria-label="Supprimer"><Trash2 size={12} /></button>
                )}
              </li>
            ))}
          </ul>
          <div className={styles.sidebarHead}>
            <h3><Layout size={14} /> Sections</h3>
            <div className={styles.addWrap}>
              <button type="button" className={styles.addSectionBtn} onClick={() => setShowAddMenu(!showAddMenu)}>
                <Plus size={14} /> Ajouter <ChevronDown size={14} />
              </button>
              {showAddMenu && (
                <div className={styles.addMenu}>
                  {Object.entries(SECTION_TYPES).map(([type, meta]) => (
                    <button key={type} type="button" onClick={() => addSection(type)}>{meta.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ul className={styles.sectionList}>
            {sections.map((sec, index) => (
              <li
                key={sec.id}
                className={`${styles.sectionItem} ${activeId === sec.id ? styles.sectionItemActive : ''} ${!sec.visible ? styles.sectionHidden : ''}`}
                draggable
                onDragStart={() => onDragStart(index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDragEnd={onDragEnd}
                onClick={() => { setActiveId(sec.id); setEditorTab('content'); }}
              >
                <GripVertical size={14} className={styles.grip} aria-hidden="true" />
                <span>{SECTION_TYPES[sec.type]?.label || sec.type}</span>
                <button type="button" className={styles.visBtn} onClick={(e) => { e.stopPropagation(); updateSection(sec.id, { ...sec, visible: !sec.visible }); }} title="Visibilité">
                  <Eye size={12} />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className={styles.main}>
          <div className={styles.editorTabs}>
            <button type="button" className={editorTab === 'content' ? styles.tabActive : ''} onClick={() => setEditorTab('content')}><Layout size={14} /> Contenu</button>
            <button type="button" className={editorTab === 'style' ? styles.tabActive : ''} onClick={() => setEditorTab('style')}><Palette size={14} /> Style</button>
            <button type="button" className={editorTab === 'design' ? styles.tabActive : ''} onClick={() => setEditorTab('design')}><Palette size={14} /> Design global</button>
            <button type="button" className={editorTab === 'seo' ? styles.tabActive : ''} onClick={() => setEditorTab('seo')}><Search size={14} /> SEO</button>
            <button type="button" className={editorTab === 'analytics' ? styles.tabActive : ''} onClick={() => setEditorTab('analytics')}><BarChart3 size={14} /> Stats</button>
            <button type="button" className={editorTab === 'advanced' ? styles.tabActive : ''} onClick={() => setEditorTab('advanced')}><Code2 size={14} /> Avancé</button>
            <button type="button" className={editorTab === 'ia' ? styles.tabActive : ''} onClick={() => setEditorTab('ia')}><Wand2 size={14} /> IA</button>
            <button type="button" className={editorTab === 'history' ? styles.tabActive : ''} onClick={() => setEditorTab('history')}><History size={14} /> Historique</button>
            <button type="button" className={editorTab === 'integrations' ? styles.tabActive : ''} onClick={() => setEditorTab('integrations')}><Plug size={14} /> Intégrations</button>
          </div>

          {editorTab === 'content' && activeSection && (
            <>
              <div className={styles.editorHead}>
                <div>
                  <h3>{SECTION_TYPES[activeSection.type]?.label}</h3>
                  <p>{SECTION_TYPES[activeSection.type]?.description}</p>
                </div>
                <div className={styles.editorHeadActions}>
                  <button type="button" className={styles.dupBtn} onClick={() => dupSection(activeSection.id)}><CopyPlus size={14} /> Dupliquer</button>
                  {sections.length > 1 && (
                    <button type="button" className={styles.deleteSectionBtn} onClick={() => removeSection(activeSection.id)}><Trash2 size={14} /> Supprimer</button>
                  )}
                </div>
              </div>
              <SectionEditor section={activeSection} onChange={(data) => updateSection(activeSection.id, data)} />
            </>
          )}

          {editorTab === 'content' && !activeSection && sections.length > 0 && (
            <div className={styles.emptyEditor}>
              <Layout size={32} aria-hidden="true" />
              <p>Sélectionnez une section dans la liste à gauche pour l&apos;éditer.</p>
            </div>
          )}

          {editorTab === 'content' && sections.length === 0 && (
            <div className={styles.emptyEditor}>
              <Plus size={32} aria-hidden="true" />
              <p>Aucune section. Cliquez sur <strong>+ Ajouter</strong> pour commencer.</p>
            </div>
          )}

          {editorTab === 'style' && activeSection && (
            <SectionStyleEditor section={activeSection} onChange={(data) => updateSection(activeSection.id, data)} />
          )}

          {editorTab === 'design' && (
            <div className={styles.designPanel}>
              <h4>Presets thème</h4>
              <div className={styles.templateRowInner}>
                {Object.entries(THEME_PRESETS).map(([id, preset]) => (
                  <button key={id} type="button" className={styles.templateBtn} onClick={() => updateSite({ theme: { ...site.theme, ...preset } })}>{preset.label}</button>
                ))}
              </div>
              <h4>Thème global</h4>
              <div className={styles.fieldRow}>
                <label className={styles.field}><span>Couleur principale</span>
                  <input type="color" value={site.theme?.primaryColor || '#C9A227'} onChange={(e) => updateSite({ theme: { ...site.theme, primaryColor: e.target.value } })} />
                </label>
                <label className={styles.field}><span>Couleur texte</span>
                  <input type="color" value={site.theme?.accentColor || '#1A1A1A'} onChange={(e) => updateSite({ theme: { ...site.theme, accentColor: e.target.value } })} />
                </label>
                <label className={styles.field}><span>Fond page</span>
                  <input type="color" value={site.theme?.backgroundColor || '#FFFFFF'} onChange={(e) => updateSite({ theme: { ...site.theme, backgroundColor: e.target.value } })} />
                </label>
              </div>
              <label className={styles.field}><span>Police</span>
                <select value={site.theme?.fontPreset || 'modern'} onChange={(e) => updateSite({ theme: { ...site.theme, fontPreset: e.target.value } })} className={styles.input}>
                  {Object.entries(FONT_PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </label>
              <label className={styles.field}><span>Coins arrondis</span>
                <select value={site.theme?.borderRadius || 'medium'} onChange={(e) => updateSite({ theme: { ...site.theme, borderRadius: e.target.value } })} className={styles.input}>
                  <option value="small">Petits</option>
                  <option value="medium">Moyens</option>
                  <option value="large">Grands</option>
                </select>
              </label>
              <h4>Options</h4>
              <label className={styles.toggleField}>
                <input type="checkbox" checked={site.settings?.showNav !== false} onChange={(e) => updateSite({ settings: { ...site.settings, showNav: e.target.checked } })} />
                Menu de navigation
              </label>
              <label className={styles.toggleField}>
                <input type="checkbox" checked={site.settings?.showFloatingWhatsapp !== false} onChange={(e) => updateSite({ settings: { ...site.settings, showFloatingWhatsapp: e.target.checked } })} />
                Bouton WhatsApp flottant
              </label>
              <label className={styles.toggleField}>
                <input type="checkbox" checked={site.settings?.animateSections !== false} onChange={(e) => updateSite({ settings: { ...site.settings, animateSections: e.target.checked } })} />
                Animations au scroll
              </label>
              <label className={styles.toggleField}>
                <input type="checkbox" checked={site.settings?.showAnnouncement || false} onChange={(e) => updateSite({ settings: { ...site.settings, showAnnouncement: e.target.checked } })} />
                Bannière d&apos;annonce (haut de page)
              </label>
              {site.settings?.showAnnouncement && (
                <label className={styles.field}><span>Texte annonce</span>
                  <input value={site.settings?.announcementText || ''} onChange={(e) => updateSite({ settings: { ...site.settings, announcementText: e.target.value } })} className={styles.input} />
                </label>
              )}
              <label className={styles.toggleField}>
                <input type="checkbox" checked={site.settings?.showPopup || false} onChange={(e) => updateSite({ settings: { ...site.settings, showPopup: e.target.checked } })} />
                Pop-up de bienvenue
              </label>
              {site.settings?.showPopup && (
                <>
                  <label className={styles.field}><span>Titre pop-up</span><input value={site.settings?.popup?.title || ''} onChange={(e) => updateSite({ settings: { ...site.settings, popup: { ...site.settings.popup, title: e.target.value } } })} className={styles.input} /></label>
                  <label className={styles.field}><span>Message</span><textarea value={site.settings?.popup?.body || ''} onChange={(e) => updateSite({ settings: { ...site.settings, popup: { ...site.settings.popup, body: e.target.value } } })} rows={2} className={styles.textarea} /></label>
                  <label className={styles.field}><span>Bouton</span><input value={site.settings?.popup?.ctaLabel || ''} onChange={(e) => updateSite({ settings: { ...site.settings, popup: { ...site.settings.popup, ctaLabel: e.target.value } } })} className={styles.input} /></label>
                </>
              )}
            </div>
          )}

          {editorTab === 'seo' && (
            <div className={styles.designPanel}>
              <h4>Référencement & partage</h4>
              <label className={styles.field}><span>Titre SEO</span>
                <input value={site.seo?.title || ''} onChange={(e) => updateSite({ seo: { ...site.seo, title: e.target.value } })} className={styles.input} placeholder={account.nom} />
              </label>
              <label className={styles.field}><span>Description</span>
                <textarea value={site.seo?.description || ''} onChange={(e) => updateSite({ seo: { ...site.seo, description: e.target.value } })} rows={3} className={styles.textarea} maxLength={160} placeholder="160 caractères max" />
              </label>
              <label className={styles.field}><span>Image de partage (Open Graph)</span>
                <DropZone accept="image/*" label="Image 1200×630 recommandé" preview={site.seo?.ogImage} onFile={(url) => updateSite({ seo: { ...site.seo, ogImage: url } })} />
              </label>
            </div>
          )}

          {editorTab === 'analytics' && (
            <div className={styles.designPanel}>
              <h4>Performance du mini-site</h4>
              <div className={styles.analyticsGrid}>
                <div className={styles.analyticsCard}><strong>{analytics.views || 0}</strong><span>Vues totales</span></div>
                <div className={styles.analyticsCard}><strong>{analytics.uniqueViews || 0}</strong><span>Visiteurs uniques</span></div>
                <div className={styles.analyticsCard}><strong>{analytics.formSubmits || 0}</strong><span>Formulaires</span></div>
                <div className={styles.analyticsCard}><strong>{analytics.newsletterSignups || 0}</strong><span>Newsletter</span></div>
              </div>
              {analytics.lastView && <p className={styles.hint}>Dernière visite : {new Date(analytics.lastView).toLocaleString('fr-FR')}</p>}
              <h4>Dernières soumissions ({formSubmissions.length})</h4>
              <ul className={styles.submissionList}>
                {formSubmissions.slice(0, 8).map((s) => (
                  <li key={s.id}>
                    <span>{s.type === 'newsletter' ? `📧 ${s.email}` : '📝 Formulaire'}</span>
                    <time>{new Date(s.date).toLocaleDateString('fr-FR')}</time>
                  </li>
                ))}
                {!formSubmissions.length && <li className={styles.hint}>Aucune soumission pour l&apos;instant.</li>}
              </ul>
            </div>
          )}

          {editorTab === 'advanced' && (
            <div className={styles.designPanel}>
              <h4>CSS personnalisé</h4>
              <textarea value={site.advanced?.customCss || ''} onChange={(e) => updateSite({ advanced: { ...site.advanced, customCss: e.target.value } })} rows={8} className={styles.codeArea} placeholder=".hero { ... }" spellCheck={false} />
              <h4>Sauvegarde & restauration</h4>
              <div className={styles.advancedActions}>
                <button type="button" className={styles.dupBtn} onClick={() => {
                  const blob = new Blob([exportMinisiteJson(site)], { type: 'application/json' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `minisite-${site.slug}.json`;
                  a.click();
                }}><Download size={14} /> Exporter JSON</button>
                <label className={styles.dupBtn}>
                  <Upload size={14} /> Importer JSON
                  <input type="file" accept="application/json" hidden onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const text = await file.text();
                    const imported = importMinisiteJson(text, account);
                    if (imported && window.confirm('Remplacer le site actuel par l\'import ?')) { setSite(imported); persist(imported); }
                  }} />
                </label>
              </div>
              <h4>Niveaux Ultra (jusqu&apos;au 77)</h4>
              <ul className={styles.levelList}>
                {Object.entries(LEVEL_MILESTONES).map(([lvl, desc]) => (
                  <li key={lvl} className={Number(lvl) <= (site.level || MINISITE_LEVEL) ? styles.levelUnlocked : ''}>
                    <strong>Niv. {lvl}</strong> — {desc}
                  </li>
                ))}
              </ul>
              <h4>QR Code du site</h4>
              <p className={styles.hint}>Partagez votre mini-site facilement : <a href={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`} target="_blank" rel="noopener noreferrer"><QrCode size={14} /> Télécharger QR</a></p>
              <h4>Sécurité page</h4>
              <label className={styles.toggleField}>
                <input type="checkbox" checked={site.security?.passwordEnabled || false} onChange={(e) => updateSite({ security: { ...site.security, passwordEnabled: e.target.checked } })} />
                Protéger le site par mot de passe
              </label>
              {site.security?.passwordEnabled && (
                <label className={styles.field}><span>Mot de passe visiteur</span>
                  <input type="text" value={site.security?.password || ''} onChange={(e) => updateSite({ security: { ...site.security, password: e.target.value } })} className={styles.input} placeholder="mot-de-passe" />
                </label>
              )}
              <label className={styles.toggleField}>
                <input type="checkbox" checked={site.settings?.showCookieBanner !== false} onChange={(e) => updateSite({ settings: { ...site.settings, showCookieBanner: e.target.checked } })} />
                Bannière cookies RGPD
              </label>
            </div>
          )}

          {editorTab === 'ia' && activeSection && (
            <div className={styles.designPanel}>
              <h4><Wand2 size={16} /> Assistant contenu IA</h4>
              <p className={styles.hint}>Génère un contenu de départ pour la section « {SECTION_TYPES[activeSection.type]?.label} » à partir de votre profil.</p>
              <button type="button" className={styles.saveBtn} style={{ marginTop: 8 }} onClick={() => {
                const generated = generateAIContent(activeSection.type, account);
                if (Object.keys(generated).length) updateSection(activeSection.id, { ...activeSection, ...generated });
              }}>Générer le contenu</button>
              <h4 style={{ marginTop: 20 }}>Langue du site</h4>
              <select value={site.locale?.active || 'fr'} onChange={(e) => updateSite({ locale: { ...site.locale, active: e.target.value } })} className={styles.input}>
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          )}

          {editorTab === 'history' && (
            <div className={styles.designPanel}>
              <h4>Historique des versions</h4>
              <button type="button" className={styles.dupBtn} onClick={() => {
                const snap = createSiteSnapshot(site, `Sauvegarde ${new Date().toLocaleString('fr-FR')}`);
                const snapshots = [snap, ...(site.snapshots || [])].slice(0, 20);
                updateSite({ snapshots });
                persist({ ...site, snapshots });
              }}><History size={14} /> Créer un snapshot</button>
              <ul className={styles.snapshotList}>
                {(site.snapshots || []).map((snap) => (
                  <li key={snap.id}>
                    <span>{snap.label}</span>
                    <button type="button" onClick={() => { if (window.confirm('Restaurer cette version ?')) { setSite(syncSitePages(snap.data)); persist(snap.data); } }}>Restaurer</button>
                  </li>
                ))}
                {!(site.snapshots || []).length && <li className={styles.hint}>Aucun snapshot. Créez-en un avant une grosse modification.</li>}
              </ul>
            </div>
          )}

          {editorTab === 'integrations' && (
            <div className={styles.designPanel}>
              <h4>Intégrations & tracking</h4>
              <label className={styles.field}><span>Google Analytics ID</span>
                <input value={site.integrations?.googleAnalyticsId || ''} onChange={(e) => updateSite({ integrations: { ...site.integrations, googleAnalyticsId: e.target.value } })} className={styles.input} placeholder="G-XXXXXXXX" />
              </label>
              <label className={styles.field}><span>Facebook Pixel ID</span>
                <input value={site.integrations?.facebookPixelId || ''} onChange={(e) => updateSite({ integrations: { ...site.integrations, facebookPixelId: e.target.value } })} className={styles.input} placeholder="123456789" />
              </label>
              <label className={styles.field}><span>Hotjar ID</span>
                <input value={site.integrations?.hotjarId || ''} onChange={(e) => updateSite({ integrations: { ...site.integrations, hotjarId: e.target.value } })} className={styles.input} placeholder="Optional" />
              </label>
              <p className={styles.hint}>Les IDs sont injectés automatiquement sur le site public (niveau 100).</p>
            </div>
          )}
        </main>

        <aside className={styles.previewPane}>
          <div className={styles.previewToolbar}>
            <h3>Aperçu live</h3>
            <div className={styles.deviceToggle}>
              <button type="button" className={previewDevice === 'desktop' ? styles.deviceActive : ''} onClick={() => setPreviewDevice('desktop')} title="Desktop"><Monitor size={14} /></button>
              <button type="button" className={previewDevice === 'mobile' ? styles.deviceActive : ''} onClick={() => setPreviewDevice('mobile')} title="Mobile"><Smartphone size={14} /></button>
            </div>
          </div>
          <div className={`${styles.previewFrame} ${previewDevice === 'mobile' ? styles.previewMobile : ''}`}>
            <MinisiteRenderer site={site} pro={account} preview />
          </div>
        </aside>
      </div>
    </div>
  );
}
