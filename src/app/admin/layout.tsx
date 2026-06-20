'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { MdDashboard, MdFlight, MdPeople, MdAssignment } from 'react-icons/md';
import styles from './admin.module.css';
import type { User } from '../types/user';

const navItems = [
  { href: '/admin', label: 'Дашборд', icon: <MdDashboard size={20} /> },
  { href: '/admin/tours', label: 'Туры', icon: <MdFlight size={20} /> },
  { href: '/admin/users', label: 'Пользователи', icon: <MdPeople size={20} /> },
  { href: '/admin/bookings', label: 'Бронирования', icon: <MdAssignment size={20} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || data.user?.role !== 'admin') {
          router.push('/');
          return;
        }
        setUser(data.user);
      });
  }, [router]);

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
        Проверка прав доступа...
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.sidebarLogo}>Летучка</Link>
          <div className={styles.sidebarSubtitle}>Панель управления</div>
        </div>
        <nav className={styles.sidebarNav}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.sidebarLink} ${pathname === item.href ? styles.active : ''}`}
            >
              <span className={styles.sidebarLinkIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.sidebarBackLink}>
            ← На сайт
          </Link>
        </div>
      </aside>

      <div className={styles.mainContent}>
        <div className={styles.topbar}>
          <div className={styles.topbarTitle}>
            {navItems.find(n => n.href === pathname)?.label ?? 'Админ панель'}
          </div>
          <div className={styles.topbarUser}>{user.name} · {user.email}</div>
        </div>
        <div className={styles.pageContent}>
          {children}
        </div>
      </div>
    </div>
  );
}
