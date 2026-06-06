import { Link } from 'react-router-dom';
import {
  Home,
  BookOpen,
  LayoutGrid,
  MapPin,
  UserPlus,
  BadgeCheck,
  Briefcase,
  ClipboardList,
  Shield,
  Info,
  FileText,
  ScrollText,
} from 'lucide-react';
import SiteNavLink from './SiteNavLink';
import styles from './Header.module.css';

const DRAWER_ICONS = {
  home: Home,
  book: BookOpen,
  grid: LayoutGrid,
  map: MapPin,
  userPlus: UserPlus,
  verified: BadgeCheck,
  briefcase: Briefcase,
  clipboard: ClipboardList,
  shield: Shield,
  info: Info,
  privacy: FileText,
  terms: ScrollText,
};

export default function DrawerNavItem({ item, onClose, useScrollNav }) {
  const Icon = DRAWER_ICONS[item.iconKey];
  const content = (
    <>
      <span
        className={styles.drawerIcon}
        style={{ background: item.accent, color: item.iconColor }}
        aria-hidden="true"
      >
        {Icon && <Icon size={18} strokeWidth={2.2} />}
      </span>
      <span className={styles.drawerLabel}>{item.label}</span>
    </>
  );

  if (useScrollNav) {
    return (
      <SiteNavLink
        to={item.to}
        className={styles.drawerLink}
        onAfterNavigate={onClose}
      >
        {content}
      </SiteNavLink>
    );
  }

  return (
    <Link to={item.to} className={styles.drawerLink} onClick={onClose}>
      {content}
    </Link>
  );
}
