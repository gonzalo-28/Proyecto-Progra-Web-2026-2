// src/components/layout/Navbar/UserMenu.jsx

import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../ui/Avatar/Avatar';
import { ROUTES } from './navbarConfig';
import styles from './UserMenu.module.css';

/**
 * Usuario autenticado en el navbar: avatar + nombre + caret.
 * Al hacer clic abre un dropdown con "Mi Cuenta" y "Cerrar sesión" (HU-1).
 * Se cierra con clic fuera, Escape o al elegir una opción.
 *
 * Props:
 *  - user: { fullName, avatarUrl? }
 *  - accountPath: ruta de "Mi Cuenta"
 *  - onLogout: () => void
 */
export default function UserMenu({
  user,
  accountPath = ROUTES.account,
  onLogout,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const handleLogout = () => {
    close();
    onLogout?.();
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={menuId}
      >
        <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
        <span className={styles.name}>{user.fullName}</span>
        <span className={styles.caret} aria-hidden="true" />
      </button>

      {isOpen && (
        <ul id={menuId} className={styles.menu}>
          <li>
            <Link to={accountPath} className={styles.item} onClick={close}>
              Mi Cuenta
            </Link>
          </li>
          <li>
            <button type="button" className={styles.item} onClick={handleLogout}>
              Cerrar sesión
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
