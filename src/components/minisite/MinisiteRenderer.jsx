import { useState, useEffect, useMemo } from 'react';
import {
  Phone, Mail, MessageCircle, MapPin, Clock, Star, Download, ExternalLink, X, ChevronDown,
} from 'lucide-react';
import { formatWhatsAppLink } from '../../utils/helpers';
import { FONT_PRESETS, getSectionNavLabel, parseVideoEmbed, getSitePages, getPageSections, t } from '../../utils/minisite';
import TrackingScripts from './TrackingScripts';
import { addMinisiteFormSubmission, addMinisiteNewsletterSignup } from '../../utils/storage';
import {
  AnnouncementBar, SitePopup, PageTabs,
  PricingSection, MapSection, FormSection, BlogSection, PartnersSection,
  BannerSection, BookingSection, NewsletterSection,
} from './MinisiteExtraSections';
import {
  ShopSection, ShopCart, TimelineSection, PortfolioSection, CompareSection,
  EventsSection, CountdownSection, SocialSection, CertificationsSection,
  QuoteSection, AudioSection, SiteCookieBanner, SitePasswordGate,
} from './MinisiteUltraSections';
import styles from './MinisiteRenderer.module.css';

function sectionBgStyle(section, theme) {
  const s = section.style || {};
  if (s.bgImage) return { backgroundImage: `url(${s.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  if (s.bgColor) return { background: s.bgColor };
  if (s.variant === 'dark') return { background: theme.accentColor, color: '#fff' };
  if (s.variant === 'accent') return { background: `${theme.primaryColor}18` };
  return {};
}

function SectionWrap({ section, theme, children, className = '' }) {
  const dark = section.style?.variant === 'dark';
  const pad = section.style?.padding === 'large' ? styles.padLarge : section.style?.padding === 'small' ? styles.padSmall : '';
  const anim = theme.animateSections !== false ? styles.animateIn : '';

  return (
    <section
      id={section.id}
      className={`${styles.section} ${pad} ${anim} ${className} ${dark ? styles.sectionDark : ''}`}
      style={sectionBgStyle(section, theme)}
    >
      <div className={styles.container}>{children}</div>
    </section>
  );
}

function SiteNav({ site, pro, theme }) {
  const [open, setOpen] = useState(false);
  if (!site.settings?.showNav) return null;

  const links = site.sections.filter((s) => s.visible && s.type !== 'hero' && SECTION_TYPES_NAV[s.type] !== false);

  return (
    <nav className={styles.siteNav} style={{ '--ms-primary': theme.primaryColor }}>
      <div className={styles.navInner}>
        <a href="#top" className={styles.navBrand}>{pro.nom}</a>
        <button type="button" className={styles.navToggle} onClick={() => setOpen(!open)} aria-label="Menu">
          <span /><span /><span />
        </button>
        <ul className={`${styles.navLinks} ${open ? styles.navOpen : ''}`}>
          {links.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} onClick={() => setOpen(false)}>{getSectionNavLabel(s)}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

const SECTION_TYPES_NAV = { cta: false, banner: false, countdown: false, quote: false };

function HeroSection({ section, pro, theme }) {
  const bg = section.coverImage
    ? { backgroundImage: `url(${section.coverImage})` }
    : { background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` };

  const ctaHref = section.ctaAction === 'phone'
    ? `tel:${(pro.telephone || '').replace(/\s/g, '')}`
    : formatWhatsAppLink(pro.telephone);

  const isSplit = section.variant === 'split';
  const videoEmbed = section.videoBackground ? parseVideoEmbed(section.videoBackground) : null;

  return (
    <header id="top" className={`${styles.hero} ${isSplit ? styles.heroSplit : ''}`} style={bg}>
      {videoEmbed?.type === 'youtube' && (
        <iframe
          title=""
          className={styles.heroVideoBg}
          src={`https://www.youtube.com/embed/${videoEmbed.id}?autoplay=1&mute=1&loop=1&playlist=${videoEmbed.id}&controls=0`}
          allow="autoplay"
        />
      )}
      {videoEmbed?.type === 'file' && (
        <video className={styles.heroVideoBg} autoPlay muted loop playsInline>
          <source src={videoEmbed.src} />
        </video>
      )}
      <div className={styles.heroOverlay}>
        <div className={styles.heroInner}>
          {section.logoImage && (
            <img src={section.logoImage} alt="" className={styles.heroLogo} />
          )}
          <p className={styles.heroEyebrow}>{pro.profession}</p>
          <h1>{section.title || pro.nom}</h1>
          {section.subtitle && <p className={styles.heroSub}>{section.subtitle}</p>}
          <div className={styles.heroActions}>
            {section.ctaLabel && (
              <a href={ctaHref} className={styles.heroCta} target="_blank" rel="noopener noreferrer">
                {section.ctaLabel}
              </a>
            )}
            {pro.telephone && (
              <a href={`tel:${pro.telephone.replace(/\s/g, '')}`} className={styles.heroCtaSecondary}>
                <Phone size={16} /> Appeler
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function AboutSection({ section, theme }) {
  const split = section.layout !== 'stacked';
  return (
    <SectionWrap section={section} theme={theme}>
      <div className={split ? styles.aboutGrid : styles.aboutStack}>
        <div>
          {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
          <p className={styles.bodyText}>{section.body}</p>
        </div>
        {section.image && (
          <div className={styles.aboutImage} style={{ backgroundImage: `url(${section.image})` }} />
        )}
      </div>
    </SectionWrap>
  );
}

function ServicesSection({ section, theme }) {
  const items = (section.items || []).filter((i) => i.title);
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.servicesGrid}>
        {items.map((item, idx) => (
          <article key={idx} className={styles.serviceCard}>
            <span className={styles.serviceNum}>{String(idx + 1).padStart(2, '0')}</span>
            <h3>{item.title}</h3>
            {item.description && <p>{item.description}</p>}
            {item.price && <span className={styles.price}>{item.price}</span>}
          </article>
        ))}
      </div>
    </SectionWrap>
  );
}

function MenuSection({ section, theme }) {
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      {(section.categories || []).map((cat, ci) => (
        <div key={ci} className={styles.menuCategory}>
          {cat.name && <h3 className={styles.menuCatName}>{cat.name}</h3>}
          <ul className={styles.menuList}>
            {(cat.items || []).filter((i) => i.title).map((item, ii) => (
              <li key={ii} className={styles.menuItem}>
                <div className={styles.menuItemHead}>
                  <strong>{item.title}</strong>
                  {item.price && <span className={styles.menuPrice}>{item.price}</span>}
                </div>
                {item.description && <p>{item.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </SectionWrap>
  );
}

function GallerySection({ section, theme }) {
  const images = (section.images || []).filter((i) => i.url);
  const [lightbox, setLightbox] = useState(null);
  if (!images.length) return null;

  const masonry = section.layout === 'masonry';

  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={masonry ? styles.galleryMasonry : styles.galleryGrid}>
        {images.map((img, idx) => (
          <figure key={idx} className={styles.galleryItem}>
            <button type="button" onClick={() => setLightbox(img)} style={{ backgroundImage: `url(${img.url})` }} aria-label={img.caption || 'Photo'} />
            {img.caption && <figcaption>{img.caption}</figcaption>}
          </figure>
        ))}
      </div>
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)} role="presentation">
          <button type="button" className={styles.lightboxClose} aria-label="Fermer"><X size={24} /></button>
          <div className={styles.lightboxImg} style={{ backgroundImage: `url(${lightbox.url})` }} onClick={(e) => e.stopPropagation()} />
          {lightbox.caption && <p>{lightbox.caption}</p>}
        </div>
      )}
    </SectionWrap>
  );
}

function StatsSection({ section, theme }) {
  const items = (section.items || []).filter((i) => i.value);
  if (!items.length) return null;
  return (
    <SectionWrap section={section} theme={theme} className={styles.statsSection}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.statsGrid}>
        {items.map((item, idx) => (
          <div key={idx} className={styles.statCard}>
            <span className={styles.statValue}>{item.value}</span>
            <span className={styles.statLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </SectionWrap>
  );
}

function TeamSection({ section, theme }) {
  const members = (section.members || []).filter((m) => m.name);
  if (!members.length) return null;
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.teamGrid}>
        {members.map((m, idx) => (
          <article key={idx} className={styles.teamCard}>
            <div className={styles.teamPhoto} style={m.photo ? { backgroundImage: `url(${m.photo})` } : undefined}>
              {!m.photo && <span>{m.name[0]}</span>}
            </div>
            <h3>{m.name}</h3>
            <span className={styles.teamRole}>{m.role}</span>
            {m.bio && <p>{m.bio}</p>}
          </article>
        ))}
      </div>
    </SectionWrap>
  );
}

function FaqSection({ section, theme }) {
  const items = (section.items || []).filter((i) => i.question);
  const [openIdx, setOpenIdx] = useState(0);
  if (!items.length) return null;

  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.faqList}>
        {items.map((item, idx) => (
          <div key={idx} className={`${styles.faqItem} ${openIdx === idx ? styles.faqOpen : ''}`}>
            <button type="button" className={styles.faqQ} onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}>
              {item.question}
              <ChevronDown size={18} />
            </button>
            {openIdx === idx && <div className={styles.faqA}>{item.answer}</div>}
          </div>
        ))}
      </div>
    </SectionWrap>
  );
}

function VideoSection({ section, theme }) {
  const embed = parseVideoEmbed(section.videoUrl);
  if (!embed && !section.posterImage) return null;

  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.videoWrap}>
        {embed?.type === 'youtube' ? (
          <iframe
            title="Vidéo"
            src={`https://www.youtube.com/embed/${embed.id}`}
            allowFullScreen
            className={styles.videoFrame}
          />
        ) : embed?.type === 'file' ? (
          <video controls poster={section.posterImage || undefined} className={styles.videoFrame}>
            <source src={embed.src} />
          </video>
        ) : section.posterImage ? (
          <div className={styles.videoPoster} style={{ backgroundImage: `url(${section.posterImage})` }} />
        ) : null}
      </div>
    </SectionWrap>
  );
}

function TestimonialsSection({ section, theme }) {
  const items = (section.items || []).filter((i) => i.text);
  if (!items.length) return null;
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.testimonialsGrid}>
        {items.map((item, idx) => (
          <blockquote key={idx} className={styles.testimonial}>
            {item.rating > 0 && (
              <div className={styles.stars}>
                {Array.from({ length: Math.min(5, item.rating) }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
            )}
            <p>&ldquo;{item.text}&rdquo;</p>
            {item.name && <cite>— {item.name}</cite>}
            {!item.name && item.author && <cite>— {item.author}</cite>}
          </blockquote>
        ))}
      </div>
    </SectionWrap>
  );
}

function ContactSection({ section, pro, theme }) {
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <div className={styles.contactGrid}>
        {section.showAddress && (pro.region || pro.quartier) && (
          <div className={styles.contactItem}>
            <MapPin size={18} aria-hidden="true" />
            <span>{pro.quartier ? `${pro.quartier}, ` : ''}{pro.region}</span>
          </div>
        )}
        {section.showPhone && pro.telephone && (
          <a href={`tel:${pro.telephone.replace(/\s/g, '')}`} className={styles.contactItem}>
            <Phone size={18} aria-hidden="true" />
            <span>{pro.telephone}</span>
          </a>
        )}
        {section.showEmail && pro.email && (
          <a href={`mailto:${pro.email}`} className={styles.contactItem}>
            <Mail size={18} aria-hidden="true" />
            <span>{pro.email}</span>
          </a>
        )}
        {section.showWhatsApp && pro.telephone && (
          <a href={formatWhatsAppLink(pro.telephone)} target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
            <MessageCircle size={18} aria-hidden="true" />
            <span>WhatsApp</span>
          </a>
        )}
        {section.showHours && pro.horaires && (
          <div className={styles.contactItem}>
            <Clock size={18} aria-hidden="true" />
            <span>{pro.horaires}</span>
          </div>
        )}
      </div>
    </SectionWrap>
  );
}

function TextSection({ section, theme }) {
  if (!section.body && !section.heading) return null;
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <p className={styles.bodyText} style={{ textAlign: section.align || 'left' }}>{section.body}</p>
    </SectionWrap>
  );
}

function FilesSection({ section, theme }) {
  const files = (section.files || []).filter((f) => f.url);
  if (!files.length) return null;
  return (
    <SectionWrap section={section} theme={theme}>
      {section.heading && <h2 className={styles.sectionTitle}>{section.heading}</h2>}
      <ul className={styles.filesList}>
        {files.map((file, idx) => (
          <li key={idx}>
            <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
              <Download size={16} aria-hidden="true" />
              {file.name || 'Document'}
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </SectionWrap>
  );
}

function CtaSection({ section, pro, theme }) {
  const href = section.buttonAction === 'phone'
    ? `tel:${(pro.telephone || '').replace(/\s/g, '')}`
    : formatWhatsAppLink(pro.telephone);

  return (
    <section id={section.id} className={styles.ctaBand} style={{ background: theme.accentColor }}>
      <div className={styles.container}>
        {section.heading && <h2>{section.heading}</h2>}
        {section.subtext && <p>{section.subtext}</p>}
        <a href={href} className={styles.ctaBtn} style={{ background: theme.primaryColor, color: theme.accentColor }} target="_blank" rel="noopener noreferrer">
          {section.buttonLabel || 'Contactez-nous'}
        </a>
      </div>
    </section>
  );
}

function FloatingWhatsApp({ pro, theme, enabled }) {
  if (!enabled || !pro.telephone) return null;
  return (
    <a href={formatWhatsAppLink(pro.telephone)} className={styles.floatingWa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
      <MessageCircle size={26} />
    </a>
  );
}

function SiteFooter({ pro, site, theme }) {
  const social = pro.social || {};
  const links = Object.entries(social).filter(([, v]) => v);

  return (
    <footer className={styles.siteFooter}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div>
            <strong className={styles.footerBrand}>{pro.nom}</strong>
            <p>{pro.profession}</p>
          </div>
          {links.length > 0 && (
            <div className={styles.footerSocial}>
              {links.map(([key, url]) => (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer">{key}</a>
              ))}
            </div>
          )}
        </div>
        <p className={styles.footerCopy}>© {new Date().getFullYear()} {pro.nom}. {t(site, 'all_rights', 'Tous droits réservés')}.</p>
      </div>
    </footer>
  );
}

function renderSection(section, pro, theme, ctx) {
  if (!section.visible) return null;
  const { SectionWrap, onFormSubmit } = ctx;
  switch (section.type) {
    case 'hero': return <HeroSection key={section.id} section={section} pro={pro} theme={theme} />;
    case 'about': return <AboutSection key={section.id} section={section} theme={theme} />;
    case 'services': return <ServicesSection key={section.id} section={section} theme={theme} />;
    case 'menu': return <MenuSection key={section.id} section={section} theme={theme} />;
    case 'gallery': return <GallerySection key={section.id} section={section} theme={theme} />;
    case 'stats': return <StatsSection key={section.id} section={section} theme={theme} />;
    case 'team': return <TeamSection key={section.id} section={section} theme={theme} />;
    case 'faq': return <FaqSection key={section.id} section={section} theme={theme} />;
    case 'video': return <VideoSection key={section.id} section={section} theme={theme} />;
    case 'testimonials': return <TestimonialsSection key={section.id} section={section} theme={theme} />;
    case 'contact': return <ContactSection key={section.id} section={section} pro={pro} theme={theme} />;
    case 'text': return <TextSection key={section.id} section={section} theme={theme} />;
    case 'files': return <FilesSection key={section.id} section={section} theme={theme} />;
    case 'cta': return <CtaSection key={section.id} section={section} pro={pro} theme={theme} />;
    case 'pricing': return <PricingSection key={section.id} section={section} theme={theme} SectionWrap={SectionWrap} />;
    case 'map': return <MapSection key={section.id} section={section} theme={theme} SectionWrap={SectionWrap} />;
    case 'form': return <FormSection key={section.id} section={section} theme={theme} SectionWrap={SectionWrap} proId={pro.id} onSubmit={onFormSubmit} />;
    case 'blog': return <BlogSection key={section.id} section={section} theme={theme} SectionWrap={SectionWrap} />;
    case 'partners': return <PartnersSection key={section.id} section={section} theme={theme} SectionWrap={SectionWrap} />;
    case 'banner': return <BannerSection key={section.id} section={section} pro={pro} theme={theme} />;
    case 'booking': return <BookingSection key={section.id} section={section} pro={pro} theme={theme} SectionWrap={SectionWrap} />;
    case 'newsletter': return <NewsletterSection key={section.id} section={section} theme={theme} SectionWrap={SectionWrap} proId={pro.id} onSubmit={onFormSubmit} />;
    case 'shop': return <ShopSection key={section.id} section={section} theme={theme} SectionWrap={SectionWrap} pro={pro} onAddToCart={ctx.onAddToCart} />;
    case 'timeline': return <TimelineSection key={section.id} section={section} theme={theme} SectionWrap={SectionWrap} />;
    case 'portfolio': return <PortfolioSection key={section.id} section={section} theme={theme} SectionWrap={SectionWrap} />;
    case 'compare': return <CompareSection key={section.id} section={section} theme={theme} SectionWrap={SectionWrap} />;
    case 'events': return <EventsSection key={section.id} section={section} theme={theme} SectionWrap={SectionWrap} />;
    case 'countdown': return <CountdownSection key={section.id} section={section} pro={pro} theme={theme} />;
    case 'social': return <SocialSection key={section.id} section={section} theme={theme} SectionWrap={SectionWrap} />;
    case 'certifications': return <CertificationsSection key={section.id} section={section} theme={theme} SectionWrap={SectionWrap} />;
    case 'quote': return <QuoteSection key={section.id} section={section} theme={theme} SectionWrap={SectionWrap} />;
    case 'audio': return <AudioSection key={section.id} section={section} theme={theme} SectionWrap={SectionWrap} />;
    default: return null;
  }
}

export default function MinisiteRenderer({ site, pro, preview = false, initialPageId = 'home' }) {
  const pages = useMemo(() => getSitePages(site), [site]);
  const [activePageId, setActivePageId] = useState(initialPageId);
  const [showPopup, setShowPopup] = useState(false);
  const [cart, setCart] = useState([]);
  const [unlocked, setUnlocked] = useState(() => !site.security?.passwordEnabled || preview);
  const [cookiesOk, setCookiesOk] = useState(() => preview || localStorage.getItem(`ms_cookies_${pro.id}`) === '1');

  useEffect(() => {
    if (preview || !site.settings?.showPopup || !site.settings?.popup?.title) return;
    const key = `ms_popup_${pro.id}_${site.settings.popup.title}`;
    if (!sessionStorage.getItem(key)) setShowPopup(true);
  }, [site, pro.id, preview]);

  const dismissPopup = () => {
    const key = `ms_popup_${pro.id}_${site.settings?.popup?.title}`;
    sessionStorage.setItem(key, '1');
    setShowPopup(false);
  };

  const theme = {
    primaryColor: '#C9A227',
    accentColor: '#1A1A1A',
    backgroundColor: '#fff',
    fontPreset: 'modern',
    darkMode: false,
    animateSections: site.settings?.animateSections !== false,
    ...site.theme,
  };
  const fontFamily = FONT_PRESETS[theme.fontPreset]?.family || FONT_PRESETS.modern.family;
  const radius = theme.borderRadius === 'large' ? '16px' : theme.borderRadius === 'small' ? '6px' : '12px';
  const isDark = theme.darkMode || theme.backgroundColor === '#0E1208';

  const sections = getPageSections(site, activePageId);
  const siteForNav = { ...site, sections };

  const onFormSubmit = (payload) => {
    if (preview) return;
    if (payload.type === 'newsletter') addMinisiteNewsletterSignup(pro.id, payload.email);
    else addMinisiteFormSubmission(pro.id, payload);
  };

  const ctx = { SectionWrap, onFormSubmit, onAddToCart: (product) => setCart((c) => [...c, product]) };

  if (!unlocked) {
    return <SitePasswordGate site={site} onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div
      className={`${styles.site} ${isDark ? styles.siteDark : ''}`}
      style={{
        '--ms-primary': theme.primaryColor,
        '--ms-accent': theme.accentColor,
        '--ms-bg': theme.backgroundColor,
        '--ms-font': fontFamily,
        '--ms-radius': radius,
      }}
    >
      {site.advanced?.customCss && <style>{site.advanced.customCss}</style>}
      {!preview && <TrackingScripts integrations={site.integrations} />}
      <AnnouncementBar site={site} theme={theme} />
      <SiteNav site={siteForNav} pro={pro} theme={theme} />
      {pages.length > 1 && (
        <PageTabs pages={pages} activePageId={activePageId} onChange={setActivePageId} />
      )}
      {sections.map((section) => renderSection(section, pro, theme, ctx))}
      <SiteFooter pro={pro} site={site} theme={theme} />
      <FloatingWhatsApp pro={pro} theme={theme} enabled={site.settings?.showFloatingWhatsapp} />
      <ShopCart cart={cart} theme={theme} pro={pro} onClear={() => setCart([])} />
      {showPopup && <SitePopup site={site} pro={pro} theme={theme} onClose={dismissPopup} />}
      {!cookiesOk && <SiteCookieBanner site={site} onAccept={() => { localStorage.setItem(`ms_cookies_${pro.id}`, '1'); setCookiesOk(true); }} />}
    </div>
  );
}
