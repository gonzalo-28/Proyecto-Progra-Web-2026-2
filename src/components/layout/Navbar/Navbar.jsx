// src/components/layout/Navbar/Navbar.jsx

import Brand from './Brand';
import NavLinks from './NavLinks';
import CampusSelect from './CampusSelect';
import AuthActions from './AuthActions';
import UserMenu from './UserMenu';
import RoleBadge from '../../ui/Badge/RoleBadge';
import styles from './Navbar.module.css';

/**
 * Navbar PRESENTACIONAL: no conoce useAuth ni el router de sesión.
 * Todo llega por props desde NavbarContainer.
 *
 * Props:
 *  - links:              [{ to, label }] ya resueltos según rol
 *  - showCampusSelector: boolean
 *  - campus, campusOptions, onCampusChange(value)
 *  - actions:            ['login' | 'register'] — botones para visitante
 *  - user:               { fullName, role, avatarUrl? } | null
 *  - accountPath, onLogout
 */
export default function Navbar({
  links = [],
  showCampusSelector = false,
  campus,
  campusOptions = [],
  onCampusChange,
  actions = [],
  user = null,
  accountPath,
  onLogout,
}) {
  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <Brand />
        <NavLinks links={links} />

        <div className={styles.right}>
          {showCampusSelector && (
            <CampusSelect
              value={campus}
              options={campusOptions}
              onChange={onCampusChange}
            />
          )}

          {user ? (
            <>
              <RoleBadge role={user.role} />
              <UserMenu
                user={user}
                accountPath={accountPath}
                onLogout={onLogout}
              />
            </>
          ) : (
            <AuthActions actions={actions} />
          )}
        </div>
      </div>
    </header>
  );
}
