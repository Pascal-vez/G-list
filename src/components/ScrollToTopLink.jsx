import { Link, useNavigate } from 'react-router-dom';
import { scrollToTop } from '../utils/scrollToId';

/** Lien interne qui remonte en haut après navigation (ex. catégories footer). */
export default function ScrollToTopLink({ to, className, children, onClick }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    e.preventDefault();
    navigate(to);
    requestAnimationFrame(() => scrollToTop('auto'));
  };

  return (
    <Link to={to} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
