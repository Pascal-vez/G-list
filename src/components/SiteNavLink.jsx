import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getScrollTargetFromPath, navigateAndScroll } from '../utils/scrollToId';

export default function SiteNavLink({ to, className, children, onAfterNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e) => {
    const scrollId = getScrollTargetFromPath(to);
    const isHomeTop = to === '/' && location.pathname === '/';

    if (isHomeTop) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      onAfterNavigate?.();
      return;
    }

    if (!scrollId) return;

    e.preventDefault();
    navigateAndScroll(to, navigate);
    onAfterNavigate?.();
  };

  return (
    <Link to={to} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
