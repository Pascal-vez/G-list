import { Link } from 'react-router-dom';
import {
  Home,
  BookOpen,
  LayoutGrid,
  MapPin,
  UserPlus,
  User,
  BadgeCheck,
  Briefcase,
  ClipboardList,
  Info,
  FileText,
  ScrollText,
  HelpCircle,
  Mail,
  Cookie,
  Scale,
  ListTree,
} from 'lucide-react';
import SiteNavLink from './SiteNavLink';
import styles from './Header.module.css';

const DRAWER_ICONS = {
  home: Home,
  book: BookOpen,
  grid: LayoutGrid,
  map: MapPin,
  userPlus: UserPlus,
  user: User,
  verified: BadgeCheck,
  briefcase: Briefcase,
  clipboard: ClipboardList,
  info: Info,
  privacy: FileText,
  terms: ScrollText,
  help: HelpCircle,
  mail: Mail,
  cookie: Cookie,
  legal: Scale,
  sitemap: ListTree,
};

export default function DrawerNavItem({ item, onClose, useScrollNav }) {
  const Icon = DRAWER_ICONS[item.iconKey];
  const content = (
    <>
      <span className={styles.drawerIcon} aria-hidden="true">
        {Icon && <Icon size={20} strokeWidth={2} />}
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
