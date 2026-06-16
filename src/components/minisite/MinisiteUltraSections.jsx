import { useState, useEffect } from 'react';
import { ShoppingCart, Check, Calendar, Award, Quote, Play, Pause } from 'lucide-react';
import { formatWhatsAppLink } from '../../utils/helpers';
import styles from './MinisiteRenderer.module.css';

export function ShopSection({ section, theme, SectionWrap, pro, onAddToCart }) {
  const products = (section.products || []).filter((p) => p.name);
  if (!products.length) return null;

  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.shopGrid}>
        {products.map((p, idx) => (
          <article key={idx} className={styles.shopCard}>
            <div className={styles.shopImage} style={p.image ? { backgroundImage: `url(${p.image})` } : undefined}>
              {!p.image && <ShoppingCart size={32} aria-hidden="true" />}
              {p.badge && <span className={styles.shopBadge}>{p.badge}</span>}
            </div>
            <div className={styles.shopBody}>
              <h3>{p.name}</h3>
              {p.description && <p>{p.description}</p>}
              <div className={styles.shopFooter}>
                <strong>{p.price} {section.currency || 'GNF'}</strong>
                <button type="button" className={styles.shopAddBtn} style={{ background: theme.primaryColor, color: theme.accentColor }} onClick={() => onAddToCart?.(p)}>
                  Ajouter
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionWrap>
  );
}

export function ShopCart({ cart, theme, pro, onClear }) {
  if (!cart.length) return null;
  const total = cart.reduce((s, i) => s + (parseInt(String(i.price).replace(/\D/g, ''), 10) || 0), 0);
  const msg = `Bonjour, je souhaite commander :\n${cart.map((i) => `• ${i.name} (${i.price})`).join('\n')}\nTotal estimé : ${total.toLocaleString('fr-FR')} GNF`;
  return (
    <div className={styles.shopCart}>
      <div className={styles.shopCartInner}>
        <ShoppingCart size={18} aria-hidden="true" />
        <span>{cart.length} article{cart.length > 1 ? 's' : ''}</span>
        <a href={formatWhatsAppLink(pro.telephone, msg)} className={styles.shopCartCheckout} style={{ background: theme.primaryColor, color: theme.accentColor }} target="_blank" rel="noopener noreferrer">
          Commander
        </a>
        <button type="button" className={styles.shopCartClear} onClick={onClear}>×</button>
      </div>
    </div>
  );
}

export function TimelineSection({ section, theme, SectionWrap }) {
  const items = (section.items || []).filter((i) => i.title);
  if (!items.length) return null;
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.timeline}>
        {items.map((item, idx) => (
          <div key={idx} className={styles.timelineItem}>
            <span className={styles.timelineYear}>{item.year}</span>
            <div className={styles.timelineContent}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionWrap>
  );
}

export function PortfolioSection({ section, theme, SectionWrap }) {
  const [cat, setCat] = useState(section.activeCategory || 'Tous');
  const cats = section.categories || ['Tous'];
  const items = (section.items || []).filter((i) => i.title && (cat === 'Tous' || i.category === cat));
  if (!items.length && !(section.items || []).length) return null;

  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.portfolioFilters}>
        {cats.map((c) => (
          <button key={c} type="button" className={cat === c ? styles.filterActive : styles.filterBtn} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      <div className={styles.portfolioGrid}>
        {items.map((item, idx) => (
          <article key={idx} className={styles.portfolioCard}>
            <div className={styles.portfolioImage} style={item.image ? { backgroundImage: `url(${item.image})` } : { background: `${theme.primaryColor}22` }} />
            <h3>{item.title}</h3>
            {item.description && <p>{item.description}</p>}
          </article>
        ))}
      </div>
    </SectionWrap>
  );
}

export function CompareSection({ section, theme, SectionWrap }) {
  const [pos, setPos] = useState(50);
  if (!section.beforeImage && !section.afterImage) return null;
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.compareWrap}>
        <div className={styles.compareAfter} style={{ backgroundImage: `url(${section.afterImage || section.beforeImage})` }} />
        <div className={styles.compareBefore} style={{ width: `${pos}%`, backgroundImage: `url(${section.beforeImage || section.afterImage})` }} />
        <input type="range" min={5} max={95} value={pos} onChange={(e) => setPos(Number(e.target.value))} className={styles.compareSlider} aria-label="Comparer avant après" />
        <span className={styles.compareLabelLeft}>{section.beforeLabel || 'Avant'}</span>
        <span className={styles.compareLabelRight}>{section.afterLabel || 'Après'}</span>
      </div>
    </SectionWrap>
  );
}

export function EventsSection({ section, theme, SectionWrap }) {
  const items = (section.items || []).filter((i) => i.title);
  if (!items.length) return null;
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.eventsList}>
        {items.map((ev, idx) => (
          <article key={idx} className={styles.eventCard}>
            <div className={styles.eventDate}><Calendar size={16} /><span>{ev.date}</span>{ev.time && <span>{ev.time}</span>}</div>
            <h3>{ev.title}</h3>
            {ev.location && <p className={styles.eventLoc}>{ev.location}</p>}
            {ev.description && <p>{ev.description}</p>}
          </article>
        ))}
      </div>
    </SectionWrap>
  );
}

export function CountdownSection({ section, pro, theme }) {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(section.targetDate).getTime() - Date.now();
      if (diff <= 0) return setLeft({ d: 0, h: 0, m: 0, s: 0 });
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [section.targetDate]);

  const href = section.ctaAction === 'phone' ? `tel:${(pro.telephone || '').replace(/\s/g, '')}` : formatWhatsAppLink(pro.telephone);

  return (
    <section id={section.id} className={styles.countdownBand} style={{ background: theme.accentColor, color: '#fff' }}>
      <div className={styles.container}>
        {section.heading && <h2>{section.heading}</h2>}
        {section.subtext && <p>{section.subtext}</p>}
        <div className={styles.countdownGrid}>
          {[['d', 'Jours'], ['h', 'Heures'], ['m', 'Min'], ['s', 'Sec']].map(([k, label]) => (
            <div key={k} className={styles.countdownUnit}><strong>{left[k]}</strong><span>{label}</span></div>
          ))}
        </div>
        {section.ctaLabel && <a href={href} className={styles.countdownCta} style={{ background: theme.primaryColor, color: theme.accentColor }} target="_blank" rel="noopener noreferrer">{section.ctaLabel}</a>}
      </div>
    </section>
  );
}

export function SocialSection({ section, theme, SectionWrap }) {
  const links = (section.links || []).filter((l) => l.label);
  if (!links.length) return null;
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.socialGrid}>
        {links.map((link, idx) => (
          <a key={idx} href={link.url || '#'} className={styles.socialCard} target="_blank" rel="noopener noreferrer" style={{ borderColor: theme.primaryColor }}>
            <strong>{link.label}</strong>
            <span>{link.platform}</span>
          </a>
        ))}
      </div>
    </SectionWrap>
  );
}

export function CertificationsSection({ section, theme, SectionWrap }) {
  const items = (section.items || []).filter((i) => i.title);
  if (!items.length) return null;
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.certGrid}>
        {items.map((cert, idx) => (
          <article key={idx} className={styles.certCard}>
            <div className={styles.certIcon} style={cert.image ? { backgroundImage: `url(${cert.image})` } : undefined}>
              {!cert.image && <Award size={28} aria-hidden="true" />}
            </div>
            <h3>{cert.title}</h3>
            <span>{cert.issuer}{cert.year ? ` · ${cert.year}` : ''}</span>
          </article>
        ))}
      </div>
    </SectionWrap>
  );
}

export function QuoteSection({ section, theme, SectionWrap }) {
  const quotes = (section.quotes || []).filter((q) => q.text);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!section.rotate || quotes.length <= 1) return undefined;
    const id = setInterval(() => setIdx((i) => (i + 1) % quotes.length), 6000);
    return () => clearInterval(id);
  }, [section.rotate, quotes.length]);
  if (!quotes.length) return null;
  const q = quotes[idx];
  return (
    <SectionWrap section={section} theme={theme} className={styles.quoteSection}>
      <Quote size={32} className={styles.quoteIcon} aria-hidden="true" />
      <blockquote><p>&ldquo;{q.text}&rdquo;</p>{q.author && <cite>— {q.author}</cite>}</blockquote>
    </SectionWrap>
  );
}

export function AudioSection({ section, theme, SectionWrap }) {
  const tracks = (section.tracks || []).filter((t) => t.title);
  const [playing, setPlaying] = useState(null);
  if (!tracks.length) return null;
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <ul className={styles.audioList}>
        {tracks.map((track, idx) => (
          <li key={idx} className={styles.audioItem}>
            <button type="button" onClick={() => setPlaying(playing === idx ? null : idx)} aria-label={playing === idx ? 'Pause' : 'Lecture'}>
              {playing === idx ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <div><strong>{track.title}</strong>{track.duration && <span>{track.duration}</span>}</div>
            {playing === idx && track.url && <audio src={track.url} controls autoPlay className={styles.audioPlayer} />}
          </li>
        ))}
      </ul>
    </SectionWrap>
  );
}

export function SiteCookieBanner({ site, onAccept }) {
  if (!site.settings?.showCookieBanner) return null;
  return (
    <div className={styles.cookieBanner}>
      <p>{site.settings.cookieMessage || 'Ce site utilise des cookies.'}</p>
      <button type="button" onClick={onAccept}>Accepter</button>
    </div>
  );
}

export function SitePasswordGate({ site, onUnlock }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  if (!site.security?.passwordEnabled) return null;

  const tryUnlock = (e) => {
    e.preventDefault();
    if (pw === site.security.password) onUnlock();
    else setErr(true);
  };

  return (
    <div className={styles.passwordGate}>
      <form onSubmit={tryUnlock}>
        <h2>Site protégé</h2>
        <p>Entrez le mot de passe pour accéder à ce site.</p>
        <input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(false); }} placeholder="Mot de passe" />
        {err && <p className={styles.passwordErr}>Mot de passe incorrect</p>}
        <button type="submit">Accéder</button>
      </form>
    </div>
  );
}
