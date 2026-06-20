'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import { getCurrentUser, logout } from '../../utils/auth';
import type { User } from '../../types/user';
import { FaUserCircle, FaCog } from 'react-icons/fa';
import { IoLogOutOutline } from 'react-icons/io5';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Re-check auth on every route change so header stays in sync after login/logout
  useEffect(() => {
    getCurrentUser().then(setUser);
    setIsMenuOpen(false);
  }, [pathname]);

  // Close menu on outside click
  useEffect(() => {
    if (!isMenuOpen) return;
    const close = () => setIsMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsMenuOpen(false);
    router.push('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href="/" className={styles.logo}>Летучка</Link>

        <nav className={styles.nav}>
          <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}>Главная</Link>
          <Link href="/tours" className={`${styles.navLink} ${pathname.startsWith('/tours') ? styles.navLinkActive : ''}`}>Туры</Link>
          <Link href="/about" className={`${styles.navLink} ${pathname === '/about' ? styles.navLinkActive : ''}`}>О нас</Link>
          <Link href="/contacts" className={`${styles.navLink} ${pathname === '/contacts' ? styles.navLinkActive : ''}`}>Контакты</Link>
        </nav>

        <div className={styles.actions}>
          {user ? (
            <div className={styles.profileContainer} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setIsMenuOpen(v => !v)}
                className={styles.profileButton}
              >
                <FaUserCircle className={styles.profileIcon} />
                <span className={styles.userName}>{user.name}</span>
              </button>
              {isMenuOpen && (
                <div className={styles.profileMenu}>
                  <Link href="/profile" className={styles.menuItem}>
                    <FaUserCircle /><span>Профиль</span>
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className={`${styles.menuItem} ${styles.menuItemAdmin}`}>
                      <FaCog /><span>Админ панель</span>
                    </Link>
                  )}
                  <div className={styles.menuDivider} />
                  <button onClick={handleLogout} className={styles.menuItem}>
                    <IoLogOutOutline /><span>Выйти</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className={styles.actionButton}>Войти</Link>
              <Link href="/register" className={`${styles.actionButton} ${styles.actionButtonPrimary}`}>Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
