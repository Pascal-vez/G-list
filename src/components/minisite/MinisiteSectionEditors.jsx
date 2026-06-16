import { useState } from 'react';
import {
  Plus, Trash2, Upload,
} from 'lucide-react';
import { readFileAsDataUrl } from '../../utils/minisite';
import styles from './MinisiteEditor.module.css';

export function DropZone({ accept, label, preview, onFile, onFiles, multiple, id }) {
  const zoneId = id || `dz-${label.replace(/\s/g, '-')}`;

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (multiple && onFiles) onFiles(files);
    else if (onFile) onFile(await readFileAsDataUrl(files[0]));
  };

  return (
    <DropZoneInner
      accept={accept}
      label={label}
      preview={preview}
      zoneId={zoneId}
      onDrop={handleFiles}
      onInput={handleFiles}
    />
  );
}

function DropZoneInner({ accept, label, preview, zoneId, onDrop, onInput }) {
  const [dragging, setDragging] = useState(false);
  return (
    <div
      className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); onDrop(e.dataTransfer.files); }}
    >
      {preview ? (
        <div className={styles.dropPreview} style={{ backgroundImage: `url(${preview})` }} />
      ) : (
        <>
          <Upload size={22} aria-hidden="true" />
          <span>{label}</span>
        </>
      )}
      <input type="file" accept={accept} onChange={(e) => onInput(e.target.files)} hidden id={zoneId} />
      <label htmlFor={zoneId} className={styles.dropLabel} />
    </div>
  );
}

export function SectionStyleEditor({ section, onChange }) {
  const style = section.style || {};
  const updateStyle = (patch) => onChange({ ...section, style: { ...style, ...patch } });

  return (
    <div className={styles.stylePanel}>
      <h4>Style de section</h4>
      <label className={styles.field}>
        <span>Variante</span>
        <select value={style.variant || 'default'} onChange={(e) => updateStyle({ variant: e.target.value })} className={styles.input}>
          <option value="default">Standard</option>
          <option value="accent">Fond accent</option>
          <option value="dark">Fond sombre</option>
        </select>
      </label>
      <label className={styles.field}>
        <span>Couleur de fond</span>
        <input type="color" value={style.bgColor || '#ffffff'} onChange={(e) => updateStyle({ bgColor: e.target.value })} />
      </label>
      <label className={styles.field}>
        <span>Image de fond</span>
        <DropZone accept="image/*" label="Image de fond" preview={style.bgImage} onFile={(url) => updateStyle({ bgImage: url })} />
        {style.bgImage && (
          <button type="button" className={styles.clearBtn} onClick={() => updateStyle({ bgImage: null })}>Retirer l&apos;image</button>
        )}
      </label>
      <label className={styles.field}>
        <span>Espacement</span>
        <select value={style.padding || 'normal'} onChange={(e) => updateStyle({ padding: e.target.value })} className={styles.input}>
          <option value="small">Compact</option>
          <option value="normal">Normal</option>
          <option value="large">Large</option>
        </select>
      </label>
      <label className={styles.field}>
        <span>Libellé menu navigation</span>
        <input value={section.navLabel || ''} onChange={(e) => onChange({ ...section, navLabel: e.target.value })} className={styles.input} placeholder="Auto si vide" />
      </label>
    </div>
  );
}

export function SectionEditor({ section, onChange }) {
  const update = (patch) => onChange({ ...section, ...patch });

  const renderBody = () => {
    switch (section.type) {
      case 'hero':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.title || ''} onChange={(e) => update({ title: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Sous-titre</span><input value={section.subtitle || ''} onChange={(e) => update({ subtitle: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Style hero</span>
              <select value={section.variant || 'fullscreen'} onChange={(e) => update({ variant: e.target.value })} className={styles.input}>
                <option value="fullscreen">Plein écran</option>
                <option value="split">Split</option>
              </select>
            </label>
            <label className={styles.field}><span>Couverture</span><DropZone accept="image/*" label="Glisser une image" preview={section.coverImage} onFile={(url) => update({ coverImage: url })} /></label>
            <label className={styles.field}><span>Logo (optionnel)</span><DropZone accept="image/*" label="Logo" preview={section.logoImage} onFile={(url) => update({ logoImage: url })} /></label>
            <label className={styles.field}><span>Vidéo de fond (URL YouTube ou mp4)</span><input value={section.videoBackground || ''} onChange={(e) => update({ videoBackground: e.target.value })} className={styles.input} placeholder="https://youtube.com/..." /></label>
            <div className={styles.fieldRow}>
              <label className={styles.field}><span>Bouton</span><input value={section.ctaLabel || ''} onChange={(e) => update({ ctaLabel: e.target.value })} className={styles.input} /></label>
              <label className={styles.field}><span>Action</span>
                <select value={section.ctaAction || 'whatsapp'} onChange={(e) => update({ ctaAction: e.target.value })} className={styles.input}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Téléphone</option>
                </select>
              </label>
            </div>
          </>
        );
      case 'about':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Contenu</span><textarea value={section.body || ''} onChange={(e) => update({ body: e.target.value })} rows={6} className={styles.textarea} /></label>
            <label className={styles.field}><span>Disposition</span>
              <select value={section.layout || 'split'} onChange={(e) => update({ layout: e.target.value })} className={styles.input}>
                <option value="split">Image + texte</option>
                <option value="stacked">Empilé</option>
              </select>
            </label>
            <label className={styles.field}><span>Image</span><DropZone accept="image/*" label="Ajouter une image" preview={section.image} onFile={(url) => update({ image: url })} /></label>
          </>
        );
      case 'services':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            {(section.items || []).map((item, i) => (
              <div key={i} className={styles.repeatCard}>
                <div className={styles.repeatHead}><span>Service {i + 1}</span><button type="button" onClick={() => update({ items: section.items.filter((_, j) => j !== i) })}><Trash2 size={14} /></button></div>
                <input placeholder="Nom" value={item.title || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...item, title: e.target.value }; update({ items }); }} className={styles.input} />
                <textarea placeholder="Description" value={item.description || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...item, description: e.target.value }; update({ items }); }} rows={2} className={styles.textarea} />
                <input placeholder="Prix" value={item.price || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...item, price: e.target.value }; update({ items }); }} className={styles.input} />
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ items: [...(section.items || []), { title: '', description: '', price: '' }] })}><Plus size={14} /> Ajouter</button>
          </>
        );
      case 'menu':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            {(section.categories || []).map((cat, ci) => (
              <div key={ci} className={styles.repeatCard}>
                <div className={styles.repeatHead}><span>Catégorie {ci + 1}</span><button type="button" onClick={() => update({ categories: section.categories.filter((_, j) => j !== ci) })}><Trash2 size={14} /></button></div>
                <input placeholder="Nom catégorie" value={cat.name || ''} onChange={(e) => { const categories = [...section.categories]; categories[ci] = { ...cat, name: e.target.value }; update({ categories }); }} className={styles.input} />
                {(cat.items || []).map((item, ii) => (
                  <div key={ii} className={styles.nestedItem}>
                    <input placeholder="Plat" value={item.title || ''} onChange={(e) => { const categories = [...section.categories]; const items = [...cat.items]; items[ii] = { ...item, title: e.target.value }; categories[ci] = { ...cat, items }; update({ categories }); }} className={styles.input} />
                    <input placeholder="Prix" value={item.price || ''} onChange={(e) => { const categories = [...section.categories]; const items = [...cat.items]; items[ii] = { ...item, price: e.target.value }; categories[ci] = { ...cat, items }; update({ categories }); }} className={styles.input} />
                    <textarea placeholder="Description" value={item.description || ''} onChange={(e) => { const categories = [...section.categories]; const items = [...cat.items]; items[ii] = { ...item, description: e.target.value }; categories[ci] = { ...cat, items }; update({ categories }); }} rows={2} className={styles.textarea} />
                  </div>
                ))}
                <button type="button" className={styles.addItemBtn} onClick={() => { const categories = [...section.categories]; categories[ci] = { ...cat, items: [...(cat.items || []), { title: '', description: '', price: '' }] }; update({ categories }); }}><Plus size={12} /> Plat</button>
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ categories: [...(section.categories || []), { name: '', items: [{ title: '', description: '', price: '' }] }] })}><Plus size={14} /> Catégorie</button>
          </>
        );
      case 'gallery':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Disposition</span>
              <select value={section.layout || 'grid'} onChange={(e) => update({ layout: e.target.value })} className={styles.input}>
                <option value="grid">Grille</option>
                <option value="masonry">Mosaïque</option>
              </select>
            </label>
            <DropZone accept="image/*" label="Glisser des photos" multiple onFiles={async (files) => {
              const urls = await Promise.all(files.map(readFileAsDataUrl));
              update({ images: [...(section.images || []), ...urls.map((url) => ({ url, caption: '' }))] });
            }} />
            <div className={styles.thumbGrid}>
              {(section.images || []).map((img, i) => (
                <div key={i} className={styles.thumb}>
                  <div style={{ backgroundImage: `url(${img.url})` }} />
                  <input placeholder="Légende" value={img.caption || ''} onChange={(e) => { const images = [...section.images]; images[i] = { ...img, caption: e.target.value }; update({ images }); }} className={styles.input} />
                  <button type="button" onClick={() => update({ images: section.images.filter((_, j) => j !== i) })}><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </>
        );
      case 'stats':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            {(section.items || []).map((item, i) => (
              <div key={i} className={styles.repeatCard}>
                <div className={styles.repeatHead}><span>Stat {i + 1}</span><button type="button" onClick={() => update({ items: section.items.filter((_, j) => j !== i) })}><Trash2 size={14} /></button></div>
                <input placeholder="Valeur (ex: 500+)" value={item.value || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...item, value: e.target.value }; update({ items }); }} className={styles.input} />
                <input placeholder="Libellé" value={item.label || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...item, label: e.target.value }; update({ items }); }} className={styles.input} />
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ items: [...(section.items || []), { value: '', label: '' }] })}><Plus size={14} /> Ajouter</button>
          </>
        );
      case 'team':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            {(section.members || []).map((m, i) => (
              <div key={i} className={styles.repeatCard}>
                <div className={styles.repeatHead}><span>Membre {i + 1}</span><button type="button" onClick={() => update({ members: section.members.filter((_, j) => j !== i) })}><Trash2 size={14} /></button></div>
                <input placeholder="Nom" value={m.name || ''} onChange={(e) => { const members = [...section.members]; members[i] = { ...m, name: e.target.value }; update({ members }); }} className={styles.input} />
                <input placeholder="Rôle" value={m.role || ''} onChange={(e) => { const members = [...section.members]; members[i] = { ...m, role: e.target.value }; update({ members }); }} className={styles.input} />
                <textarea placeholder="Bio" value={m.bio || ''} onChange={(e) => { const members = [...section.members]; members[i] = { ...m, bio: e.target.value }; update({ members }); }} rows={2} className={styles.textarea} />
                <DropZone accept="image/*" label="Photo" preview={m.photo} onFile={(url) => { const members = [...section.members]; members[i] = { ...m, photo: url }; update({ members }); }} />
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ members: [...(section.members || []), { name: '', role: '', bio: '', photo: null }] })}><Plus size={14} /> Membre</button>
          </>
        );
      case 'faq':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            {(section.items || []).map((item, i) => (
              <div key={i} className={styles.repeatCard}>
                <div className={styles.repeatHead}><span>Question {i + 1}</span><button type="button" onClick={() => update({ items: section.items.filter((_, j) => j !== i) })}><Trash2 size={14} /></button></div>
                <input placeholder="Question" value={item.question || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...item, question: e.target.value }; update({ items }); }} className={styles.input} />
                <textarea placeholder="Réponse" value={item.answer || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...item, answer: e.target.value }; update({ items }); }} rows={3} className={styles.textarea} />
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ items: [...(section.items || []), { question: '', answer: '' }] })}><Plus size={14} /> Question</button>
          </>
        );
      case 'video':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>URL YouTube ou fichier</span><input value={section.videoUrl || ''} onChange={(e) => update({ videoUrl: e.target.value })} className={styles.input} placeholder="https://youtube.com/watch?v=..." /></label>
            <label className={styles.field}><span>Miniature</span><DropZone accept="image/*" label="Image de couverture" preview={section.posterImage} onFile={(url) => update({ posterImage: url })} /></label>
          </>
        );
      case 'testimonials':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            {(section.items || []).map((item, i) => (
              <div key={i} className={styles.repeatCard}>
                <div className={styles.repeatHead}><span>Avis {i + 1}</span><button type="button" onClick={() => update({ items: section.items.filter((_, j) => j !== i) })}><Trash2 size={14} /></button></div>
                <input placeholder="Nom" value={item.name || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...item, name: e.target.value }; update({ items }); }} className={styles.input} />
                <textarea placeholder="Témoignage" value={item.text || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...item, text: e.target.value }; update({ items }); }} rows={3} className={styles.textarea} />
                <input type="number" min={0} max={5} placeholder="Note 1-5" value={item.rating || 0} onChange={(e) => { const items = [...section.items]; items[i] = { ...item, rating: Number(e.target.value) }; update({ items }); }} className={styles.input} />
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ items: [...(section.items || []), { name: '', text: '', rating: 5 }] })}><Plus size={14} /> Ajouter</button>
          </>
        );
      case 'contact':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            {[['showPhone', 'Téléphone'], ['showEmail', 'Email'], ['showWhatsApp', 'WhatsApp'], ['showAddress', 'Adresse'], ['showHours', 'Horaires']].map(([key, label]) => (
              <label key={key} className={styles.toggleField}>
                <input type="checkbox" checked={section[key] !== false} onChange={(e) => update({ [key]: e.target.checked })} />
                Afficher {label}
              </label>
            ))}
          </>
        );
      case 'text':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Contenu</span><textarea value={section.body || ''} onChange={(e) => update({ body: e.target.value })} rows={8} className={styles.textarea} /></label>
            <label className={styles.field}><span>Alignement</span>
              <select value={section.align || 'left'} onChange={(e) => update({ align: e.target.value })} className={styles.input}>
                <option value="left">Gauche</option>
                <option value="center">Centré</option>
              </select>
            </label>
          </>
        );
      case 'files':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            <DropZone accept="image/*,.pdf" label="Glisser fichiers" multiple onFiles={async (files) => {
              const newFiles = await Promise.all(files.map(async (f) => ({ name: f.name, url: await readFileAsDataUrl(f), type: f.type })));
              update({ files: [...(section.files || []), ...newFiles] });
            }} />
            <ul className={styles.fileList}>
              {(section.files || []).map((f, i) => (
                <li key={i}><span>{f.name}</span><button type="button" onClick={() => update({ files: section.files.filter((_, j) => j !== i) })}><Trash2 size={14} /></button></li>
              ))}
            </ul>
          </>
        );
      case 'cta':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Sous-texte</span><input value={section.subtext || ''} onChange={(e) => update({ subtext: e.target.value })} className={styles.input} /></label>
            <div className={styles.fieldRow}>
              <label className={styles.field}><span>Bouton</span><input value={section.buttonLabel || ''} onChange={(e) => update({ buttonLabel: e.target.value })} className={styles.input} /></label>
              <label className={styles.field}><span>Action</span>
                <select value={section.buttonAction || 'whatsapp'} onChange={(e) => update({ buttonAction: e.target.value })} className={styles.input}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Téléphone</option>
                </select>
              </label>
            </div>
          </>
        );
      case 'pricing':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            {(section.plans || []).map((plan, i) => (
              <div key={i} className={styles.repeatCard}>
                <div className={styles.repeatHead}><span>Formule {i + 1}</span><button type="button" onClick={() => update({ plans: section.plans.filter((_, j) => j !== i) })}><Trash2 size={14} /></button></div>
                <input placeholder="Nom" value={plan.name || ''} onChange={(e) => { const plans = [...section.plans]; plans[i] = { ...plan, name: e.target.value }; update({ plans }); }} className={styles.input} />
                <div className={styles.fieldRow}>
                  <input placeholder="Prix" value={plan.price || ''} onChange={(e) => { const plans = [...section.plans]; plans[i] = { ...plan, price: e.target.value }; update({ plans }); }} className={styles.input} />
                  <input placeholder="/mois" value={plan.period || ''} onChange={(e) => { const plans = [...section.plans]; plans[i] = { ...plan, period: e.target.value }; update({ plans }); }} className={styles.input} />
                </div>
                <textarea placeholder="Fonctionnalités (une par ligne)" value={(plan.features || []).join('\n')} onChange={(e) => { const plans = [...section.plans]; plans[i] = { ...plan, features: e.target.value.split('\n').filter(Boolean) }; update({ plans }); }} rows={3} className={styles.textarea} />
                <label className={styles.toggleField}><input type="checkbox" checked={!!plan.highlighted} onChange={(e) => { const plans = [...section.plans]; plans[i] = { ...plan, highlighted: e.target.checked }; update({ plans }); }} /> Mettre en avant</label>
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ plans: [...(section.plans || []), { name: '', price: '', period: '', features: [], highlighted: false }] })}><Plus size={14} /> Formule</button>
          </>
        );
      case 'map':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Adresse</span><input value={section.address || ''} onChange={(e) => update({ address: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>URL embed Google Maps (optionnel)</span><input value={section.embedUrl || ''} onChange={(e) => update({ embedUrl: e.target.value })} className={styles.input} placeholder="https://www.google.com/maps/embed?..." /></label>
            <label className={styles.field}><span>Lien Google Maps</span><input value={section.mapLink || ''} onChange={(e) => update({ mapLink: e.target.value })} className={styles.input} /></label>
          </>
        );
      case 'form':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Message de succès</span><input value={section.successMessage || ''} onChange={(e) => update({ successMessage: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Bouton envoi</span><input value={section.submitLabel || ''} onChange={(e) => update({ submitLabel: e.target.value })} className={styles.input} /></label>
            {(section.fields || []).map((f, i) => (
              <div key={i} className={styles.repeatCard}>
                <div className={styles.repeatHead}><span>Champ {i + 1}</span><button type="button" onClick={() => update({ fields: section.fields.filter((_, j) => j !== i) })}><Trash2 size={14} /></button></div>
                <input placeholder="Label" value={f.label || ''} onChange={(e) => { const fields = [...section.fields]; fields[i] = { ...f, label: e.target.value }; update({ fields }); }} className={styles.input} />
                <select value={f.type || 'text'} onChange={(e) => { const fields = [...section.fields]; fields[i] = { ...f, type: e.target.value }; update({ fields }); }} className={styles.input}>
                  <option value="text">Texte</option><option value="email">Email</option><option value="tel">Téléphone</option><option value="textarea">Zone de texte</option>
                </select>
                <label className={styles.toggleField}><input type="checkbox" checked={!!f.required} onChange={(e) => { const fields = [...section.fields]; fields[i] = { ...f, required: e.target.checked }; update({ fields }); }} /> Obligatoire</label>
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ fields: [...(section.fields || []), { id: `f_${Date.now()}`, type: 'text', label: '', required: false }] })}><Plus size={14} /> Champ</button>
          </>
        );
      case 'blog':
        return (
          <>
            <label className={styles.field}><span>Titre section</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            {(section.posts || []).map((post, i) => (
              <div key={i} className={styles.repeatCard}>
                <div className={styles.repeatHead}><span>Article {i + 1}</span><button type="button" onClick={() => update({ posts: section.posts.filter((_, j) => j !== i) })}><Trash2 size={14} /></button></div>
                <input placeholder="Titre" value={post.title || ''} onChange={(e) => { const posts = [...section.posts]; posts[i] = { ...post, title: e.target.value }; update({ posts }); }} className={styles.input} />
                <input type="date" value={post.date || ''} onChange={(e) => { const posts = [...section.posts]; posts[i] = { ...post, date: e.target.value }; update({ posts }); }} className={styles.input} />
                <textarea placeholder="Extrait" value={post.excerpt || ''} onChange={(e) => { const posts = [...section.posts]; posts[i] = { ...post, excerpt: e.target.value }; update({ posts }); }} rows={2} className={styles.textarea} />
                <DropZone accept="image/*" label="Image" preview={post.image} onFile={(url) => { const posts = [...section.posts]; posts[i] = { ...post, image: url }; update({ posts }); }} />
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ posts: [...(section.posts || []), { title: '', date: '', excerpt: '', image: null }] })}><Plus size={14} /> Article</button>
          </>
        );
      case 'partners':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            {(section.logos || []).map((logo, i) => (
              <div key={i} className={styles.repeatCard}>
                <div className={styles.repeatHead}><span>Partenaire {i + 1}</span><button type="button" onClick={() => update({ logos: section.logos.filter((_, j) => j !== i) })}><Trash2 size={14} /></button></div>
                <input placeholder="Nom" value={logo.name || ''} onChange={(e) => { const logos = [...section.logos]; logos[i] = { ...logo, name: e.target.value }; update({ logos }); }} className={styles.input} />
                <DropZone accept="image/*" label="Logo" preview={logo.logo} onFile={(url) => { const logos = [...section.logos]; logos[i] = { ...logo, logo: url }; update({ logos }); }} />
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ logos: [...(section.logos || []), { name: '', logo: null, url: '' }] })}><Plus size={14} /> Partenaire</button>
          </>
        );
      case 'banner':
        return (
          <>
            <label className={styles.field}><span>Texte principal</span><input value={section.text || ''} onChange={(e) => update({ text: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Sous-texte</span><input value={section.subtext || ''} onChange={(e) => update({ subtext: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Bouton</span><input value={section.linkLabel || ''} onChange={(e) => update({ linkLabel: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Style</span>
              <select value={section.style || 'accent'} onChange={(e) => update({ style: e.target.value })} className={styles.input}>
                <option value="accent">Accent</option><option value="dark">Sombre</option>
              </select>
            </label>
          </>
        );
      case 'booking':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Introduction</span><textarea value={section.intro || ''} onChange={(e) => update({ intro: e.target.value })} rows={2} className={styles.textarea} /></label>
            <label className={styles.field}><span>Créneaux (un par ligne)</span><textarea value={(section.slots || []).join('\n')} onChange={(e) => update({ slots: e.target.value.split('\n').filter(Boolean) })} rows={4} className={styles.textarea} /></label>
            <label className={styles.field}><span>Bouton</span><input value={section.ctaLabel || ''} onChange={(e) => update({ ctaLabel: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Note</span><input value={section.note || ''} onChange={(e) => update({ note: e.target.value })} className={styles.input} /></label>
          </>
        );
      case 'newsletter':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Sous-texte</span><input value={section.subtext || ''} onChange={(e) => update({ subtext: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Placeholder email</span><input value={section.placeholder || ''} onChange={(e) => update({ placeholder: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Bouton</span><input value={section.buttonLabel || ''} onChange={(e) => update({ buttonLabel: e.target.value })} className={styles.input} /></label>
          </>
        );
      case 'shop':
        return (
          <>
            <label className={styles.field}><span>Titre boutique</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            {(section.products || []).map((p, i) => (
              <div key={i} className={styles.repeatCard}>
                <div className={styles.repeatHead}><span>Produit {i + 1}</span><button type="button" onClick={() => update({ products: section.products.filter((_, j) => j !== i) })}><Trash2 size={14} /></button></div>
                <input placeholder="Nom" value={p.name || ''} onChange={(e) => { const products = [...section.products]; products[i] = { ...p, name: e.target.value }; update({ products }); }} className={styles.input} />
                <textarea placeholder="Description" value={p.description || ''} onChange={(e) => { const products = [...section.products]; products[i] = { ...p, description: e.target.value }; update({ products }); }} rows={2} className={styles.textarea} />
                <input placeholder="Prix" value={p.price || ''} onChange={(e) => { const products = [...section.products]; products[i] = { ...p, price: e.target.value }; update({ products }); }} className={styles.input} />
                <input placeholder="Badge (ex: Nouveau)" value={p.badge || ''} onChange={(e) => { const products = [...section.products]; products[i] = { ...p, badge: e.target.value }; update({ products }); }} className={styles.input} />
                <DropZone accept="image/*" label="Photo produit" preview={p.image} onFile={(url) => { const products = [...section.products]; products[i] = { ...p, image: url }; update({ products }); }} />
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ products: [...(section.products || []), { name: '', description: '', price: '', image: null, badge: '' }] })}><Plus size={14} /> Produit</button>
          </>
        );
      case 'timeline':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            {(section.items || []).map((item, i) => (
              <div key={i} className={styles.repeatCard}>
                <div className={styles.repeatHead}><span>Étape {i + 1}</span><button type="button" onClick={() => update({ items: section.items.filter((_, j) => j !== i) })}><Trash2 size={14} /></button></div>
                <input placeholder="Année" value={item.year || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...item, year: e.target.value }; update({ items }); }} className={styles.input} />
                <input placeholder="Titre" value={item.title || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...item, title: e.target.value }; update({ items }); }} className={styles.input} />
                <textarea placeholder="Description" value={item.description || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...item, description: e.target.value }; update({ items }); }} rows={2} className={styles.textarea} />
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ items: [...(section.items || []), { year: '', title: '', description: '' }] })}><Plus size={14} /> Étape</button>
          </>
        );
      case 'portfolio':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Catégories (virgules)</span><input value={(section.categories || []).join(', ')} onChange={(e) => update({ categories: ['Tous', ...e.target.value.split(',').map((s) => s.trim()).filter(Boolean)] })} className={styles.input} /></label>
            {(section.items || []).map((item, i) => (
              <div key={i} className={styles.repeatCard}>
                <input placeholder="Titre" value={item.title || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...item, title: e.target.value }; update({ items }); }} className={styles.input} />
                <input placeholder="Catégorie" value={item.category || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...item, category: e.target.value }; update({ items }); }} className={styles.input} />
                <textarea placeholder="Description" value={item.description || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...item, description: e.target.value }; update({ items }); }} rows={2} className={styles.textarea} />
                <DropZone accept="image/*" label="Image" preview={item.image} onFile={(url) => { const items = [...section.items]; items[i] = { ...item, image: url }; update({ items }); }} />
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ items: [...(section.items || []), { title: '', category: '', description: '', image: null }] })}><Plus size={14} /> Projet</button>
          </>
        );
      case 'compare':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Image avant</span><DropZone accept="image/*" label="Avant" preview={section.beforeImage} onFile={(url) => update({ beforeImage: url })} /></label>
            <label className={styles.field}><span>Image après</span><DropZone accept="image/*" label="Après" preview={section.afterImage} onFile={(url) => update({ afterImage: url })} /></label>
          </>
        );
      case 'events':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            {(section.items || []).map((ev, i) => (
              <div key={i} className={styles.repeatCard}>
                <input placeholder="Titre" value={ev.title || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...ev, title: e.target.value }; update({ items }); }} className={styles.input} />
                <input type="date" value={ev.date || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...ev, date: e.target.value }; update({ items }); }} className={styles.input} />
                <input placeholder="Lieu" value={ev.location || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...ev, location: e.target.value }; update({ items }); }} className={styles.input} />
                <textarea placeholder="Description" value={ev.description || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...ev, description: e.target.value }; update({ items }); }} rows={2} className={styles.textarea} />
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ items: [...(section.items || []), { title: '', date: '', location: '', description: '' }] })}><Plus size={14} /> Événement</button>
          </>
        );
      case 'countdown':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Date cible</span><input type="datetime-local" value={section.targetDate?.slice(0, 16) || ''} onChange={(e) => update({ targetDate: e.target.value })} className={styles.input} /></label>
            <label className={styles.field}><span>Bouton</span><input value={section.ctaLabel || ''} onChange={(e) => update({ ctaLabel: e.target.value })} className={styles.input} /></label>
          </>
        );
      case 'social':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            {(section.links || []).map((link, i) => (
              <div key={i} className={styles.repeatCard}>
                <input placeholder="Label" value={link.label || ''} onChange={(e) => { const links = [...section.links]; links[i] = { ...link, label: e.target.value }; update({ links }); }} className={styles.input} />
                <input placeholder="URL" value={link.url || ''} onChange={(e) => { const links = [...section.links]; links[i] = { ...link, url: e.target.value }; update({ links }); }} className={styles.input} />
                <input placeholder="Plateforme" value={link.platform || ''} onChange={(e) => { const links = [...section.links]; links[i] = { ...link, platform: e.target.value }; update({ links }); }} className={styles.input} />
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ links: [...(section.links || []), { label: '', url: '', platform: '' }] })}><Plus size={14} /> Lien</button>
          </>
        );
      case 'certifications':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            {(section.items || []).map((cert, i) => (
              <div key={i} className={styles.repeatCard}>
                <input placeholder="Titre" value={cert.title || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...cert, title: e.target.value }; update({ items }); }} className={styles.input} />
                <input placeholder="Organisme" value={cert.issuer || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...cert, issuer: e.target.value }; update({ items }); }} className={styles.input} />
                <input placeholder="Année" value={cert.year || ''} onChange={(e) => { const items = [...section.items]; items[i] = { ...cert, year: e.target.value }; update({ items }); }} className={styles.input} />
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ items: [...(section.items || []), { title: '', issuer: '', year: '' }] })}><Plus size={14} /> Certification</button>
          </>
        );
      case 'quote':
        return (
          <>
            <label className={styles.toggleField}><input type="checkbox" checked={section.rotate !== false} onChange={(e) => update({ rotate: e.target.checked })} /> Rotation automatique</label>
            {(section.quotes || []).map((q, i) => (
              <div key={i} className={styles.repeatCard}>
                <textarea placeholder="Citation" value={q.text || ''} onChange={(e) => { const quotes = [...section.quotes]; quotes[i] = { ...q, text: e.target.value }; update({ quotes }); }} rows={2} className={styles.textarea} />
                <input placeholder="Auteur" value={q.author || ''} onChange={(e) => { const quotes = [...section.quotes]; quotes[i] = { ...q, author: e.target.value }; update({ quotes }); }} className={styles.input} />
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ quotes: [...(section.quotes || []), { text: '', author: '' }] })}><Plus size={14} /> Citation</button>
          </>
        );
      case 'audio':
        return (
          <>
            <label className={styles.field}><span>Titre</span><input value={section.heading || ''} onChange={(e) => update({ heading: e.target.value })} className={styles.input} /></label>
            {(section.tracks || []).map((track, i) => (
              <div key={i} className={styles.repeatCard}>
                <input placeholder="Titre piste" value={track.title || ''} onChange={(e) => { const tracks = [...section.tracks]; tracks[i] = { ...track, title: e.target.value }; update({ tracks }); }} className={styles.input} />
                <input placeholder="URL audio (mp3)" value={track.url || ''} onChange={(e) => { const tracks = [...section.tracks]; tracks[i] = { ...track, url: e.target.value }; update({ tracks }); }} className={styles.input} />
                <input placeholder="Durée" value={track.duration || ''} onChange={(e) => { const tracks = [...section.tracks]; tracks[i] = { ...track, duration: e.target.value }; update({ tracks }); }} className={styles.input} />
              </div>
            ))}
            <button type="button" className={styles.addItemBtn} onClick={() => update({ tracks: [...(section.tracks || []), { title: '', url: '', duration: '' }] })}><Plus size={14} /> Piste</button>
          </>
        );
      default:
        return <p className={styles.hint}>Section non reconnue.</p>;
    }
  };

  return <div className={styles.fields}>{renderBody()}</div>;
}
