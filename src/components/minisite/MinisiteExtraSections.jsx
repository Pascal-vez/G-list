import { useState } from 'react';
import { MapPin, Check, Calendar, Mail } from 'lucide-react';
import { formatWhatsAppLink } from '../../utils/helpers';
import styles from './MinisiteRenderer.module.css';

export function AnnouncementBar({ site, theme }) {
  if (!site.settings?.showAnnouncement || !site.settings?.announcementText) return null;
  return (
    <div className={styles.announceBar} style={{ background: theme.primaryColor, color: theme.accentColor }}>
      <p>{site.settings.announcementText}</p>
    </div>
  );
}

export function SitePopup({ site, pro, theme, onClose }) {
  const popup = site.settings?.popup;
  if (!site.settings?.showPopup || !popup?.title) return null;

  const href = popup.ctaAction === 'phone'
    ? `tel:${(pro.telephone || '').replace(/\s/g, '')}`
    : formatWhatsAppLink(pro.telephone);

  return (
    <div className={styles.popupOverlay} onClick={onClose} role="presentation">
      <div className={styles.popupCard} onClick={(e) => e.stopPropagation()}>
        <h3>{popup.title}</h3>
        {popup.body && <p>{popup.body}</p>}
        <div className={styles.popupActions}>
          {popup.ctaLabel && pro.telephone && (
            <a href={href} className={styles.popupCta} style={{ background: theme.primaryColor, color: theme.accentColor }} target="_blank" rel="noopener noreferrer">
              {popup.ctaLabel}
            </a>
          )}
          <button type="button" className={styles.popupClose} onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

export function PageTabs({ pages, activePageId, onChange, baseSlug }) {
  if (!pages || pages.length <= 1) return null;
  return (
    <div className={styles.pageTabs}>
      {pages.map((p) => (
        <button
          key={p.id}
          type="button"
          className={activePageId === p.id ? styles.pageTabActive : styles.pageTab}
          onClick={() => onChange(p.id)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function PricingSection({ section, theme, SectionWrap }) {
  const plans = (section.plans || []).filter((p) => p.name);
  if (!plans.length) return null;
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.pricingGrid}>
        {plans.map((plan, idx) => (
          <article key={idx} className={`${styles.pricingCard} ${plan.highlighted ? styles.pricingFeatured : ''}`} style={plan.highlighted ? { borderColor: theme.primaryColor } : undefined}>
            <h3>{plan.name}</h3>
            <div className={styles.pricingPrice}>
              <strong>{plan.price}</strong>
              {plan.period && <span>{plan.period}</span>}
            </div>
            <ul className={styles.pricingFeatures}>
              {(plan.features || []).map((f, fi) => (
                <li key={fi}><Check size={14} aria-hidden="true" /> {f}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </SectionWrap>
  );
}

export function MapSection({ section, theme, SectionWrap }) {
  const embed = section.embedUrl || (section.mapLink ? null : `https://maps.google.com/maps?q=${encodeURIComponent(section.address || 'Conakry')}&output=embed`);
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      {section.address && (
        <p className={styles.mapAddress}><MapPin size={16} /> {section.address}</p>
      )}
      <div className={styles.mapFrame}>
        {section.embedUrl || embed ? (
          <iframe title="Carte" src={section.embedUrl || embed} className={styles.mapEmbed} loading="lazy" />
        ) : section.mapLink ? (
          <a href={section.mapLink} target="_blank" rel="noopener noreferrer" className={styles.mapLink}>Ouvrir dans Google Maps</a>
        ) : null}
      </div>
    </SectionWrap>
  );
}

export function FormSection({ section, theme, SectionWrap, proId, onSubmit }) {
  const [values, setValues] = useState({});
  const [sent, setSent] = useState(false);
  const fields = section.fields || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ type: 'form', fields: values, proId });
    setSent(true);
  };

  if (sent) {
    return (
      <SectionWrap section={section} theme={theme}>
        <div className={styles.formSuccess}>{section.successMessage || 'Message envoyé !'}</div>
      </SectionWrap>
    );
  }

  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <form className={styles.siteForm} onSubmit={handleSubmit}>
        {fields.map((f) => (
          <label key={f.id} className={styles.formField}>
            <span>{f.label}{f.required ? ' *' : ''}</span>
            {f.type === 'textarea' ? (
              <textarea required={f.required} value={values[f.id] || ''} onChange={(e) => setValues({ ...values, [f.id]: e.target.value })} rows={4} />
            ) : (
              <input type={f.type || 'text'} required={f.required} value={values[f.id] || ''} onChange={(e) => setValues({ ...values, [f.id]: e.target.value })} />
            )}
          </label>
        ))}
        <button type="submit" className={styles.formSubmit} style={{ background: theme.primaryColor, color: theme.accentColor }}>
          {section.submitLabel || 'Envoyer'}
        </button>
      </form>
    </SectionWrap>
  );
}

export function BlogSection({ section, theme, SectionWrap }) {
  const posts = (section.posts || []).filter((p) => p.title);
  if (!posts.length) return null;
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.blogGrid}>
        {posts.map((post, idx) => (
          <article key={idx} className={styles.blogCard}>
            {post.image && <div className={styles.blogImage} style={{ backgroundImage: `url(${post.image})` }} />}
            <div className={styles.blogBody}>
              {post.date && <time>{post.date}</time>}
              <h3>{post.title}</h3>
              {post.excerpt && <p>{post.excerpt}</p>}
            </div>
          </article>
        ))}
      </div>
    </SectionWrap>
  );
}

export function PartnersSection({ section, theme, SectionWrap }) {
  const logos = (section.logos || []).filter((l) => l.name);
  if (!logos.length) return null;
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.partnersRow}>
        {logos.map((logo, idx) => (
          <div key={idx} className={styles.partnerItem}>
            {logo.logo ? (
              <img src={logo.logo} alt={logo.name} />
            ) : (
              <span className={styles.partnerPlaceholder}>{logo.name}</span>
            )}
          </div>
        ))}
      </div>
    </SectionWrap>
  );
}

export function BannerSection({ section, pro, theme }) {
  if (!section.text) return null;
  const href = section.linkAction === 'phone'
    ? `tel:${(pro.telephone || '').replace(/\s/g, '')}`
    : formatWhatsAppLink(pro.telephone);
  const bg = section.style === 'dark' ? theme.accentColor : theme.primaryColor;
  const color = section.style === 'dark' ? '#fff' : theme.accentColor;

  return (
    <section id={section.id} className={styles.promoBanner} style={{ background: bg, color }}>
      <div className={styles.container}>
        <div className={styles.promoBannerInner}>
          <div>
            <strong>{section.text}</strong>
            {section.subtext && <p>{section.subtext}</p>}
          </div>
          {section.linkLabel && (
            <a href={href} className={styles.promoBannerBtn} target="_blank" rel="noopener noreferrer">{section.linkLabel}</a>
          )}
        </div>
      </div>
    </section>
  );
}

export function BookingSection({ section, pro, theme, SectionWrap }) {
  const slots = (section.slots || []).filter(Boolean);
  const href = formatWhatsAppLink(pro.telephone, `Bonjour, je souhaite réserver un créneau.`);

  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      {section.intro && <p className={styles.bodyText}>{section.intro}</p>}
      <ul className={styles.bookingSlots}>
        {slots.map((slot, idx) => (
          <li key={idx}><Calendar size={16} aria-hidden="true" /> {slot}</li>
        ))}
      </ul>
      {section.note && <p className={styles.bookingNote}>{section.note}</p>}
      <a href={href} className={styles.bookingCta} style={{ background: theme.primaryColor, color: theme.accentColor }} target="_blank" rel="noopener noreferrer">
        {section.ctaLabel || 'Réserver'}
      </a>
    </SectionWrap>
  );
}

export function NewsletterSection({ section, theme, SectionWrap, proId, onSubmit }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSubmit?.({ type: 'newsletter', email: email.trim(), proId });
    setSent(true);
  };

  return (
    <SectionWrap section={section} theme={theme} className={styles.newsletterSection}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      {section.subtext && <p className={styles.bodyText}>{section.subtext}</p>}
      {sent ? (
        <p className={styles.formSuccess}>Merci pour votre inscription !</p>
      ) : (
        <form className={styles.newsletterForm} onSubmit={handleSubmit}>
          <Mail size={18} aria-hidden="true" />
          <input type="email" required placeholder={section.placeholder || 'Email'} value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" style={{ background: theme.primaryColor, color: theme.accentColor }}>{section.buttonLabel || "S'inscrire"}</button>
        </form>
      )}
    </SectionWrap>
  );
}
