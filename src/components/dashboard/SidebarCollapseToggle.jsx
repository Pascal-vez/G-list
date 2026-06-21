import { ChevronLeft } from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import styles from './SidebarCollapseToggle.module.css';

export default function SidebarCollapseToggle() {
  const { collapsed, toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      className={styles.sidebarCollapseToggle}
      onClick={toggleSidebar}
      aria-label={collapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
    >
      <ChevronLeft
        size={24}
        strokeWidth={3}
        className={`${styles.chevron} ${collapsed ? styles.chevronCollapsed : ''}`}
        aria-hidden="true"
      />
    </button>
  );
}
