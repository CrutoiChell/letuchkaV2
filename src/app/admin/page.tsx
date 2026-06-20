'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

interface Stats {
  users: number;
  tours: number;
  bookings: number;
}

interface RecentBooking {
  id: string;
  status: string;
  created_at: string;
  user: { name: string; email: string };
  tour: { title: string; price: string };
}

const statusLabel: Record<string, string> = { pending: 'Ожидает', confirmed: 'Подтверждено', cancelled: 'Отменено' };
const statusClass: Record<string, string> = { pending: styles.badgePending, confirmed: styles.badgeConfirmed, cancelled: styles.badgeCancelled };

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data.stats);
        setRecentBookings(data.recentBookings || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Загрузка...</div>;

  return (
    <div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statValue}>{stats?.users ?? 0}</div>
          <div className={styles.statLabel}>Пользователей</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✈️</div>
          <div className={styles.statValue}>{stats?.tours ?? 0}</div>
          <div className={styles.statLabel}>Активных туров</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📋</div>
          <div className={styles.statValue}>{stats?.bookings ?? 0}</div>
          <div className={styles.statLabel}>Бронирований</div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Последние бронирования</h2>
          <Link href="/admin/bookings" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}>
            Все бронирования
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <div className={styles.emptyState}>Нет бронирований</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Тур</th>
                <th>Цена</th>
                <th>Дата</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(b => (
                <tr key={b.id}>
                  <td>
                    <div>{b.user?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{b.user?.email}</div>
                  </td>
                  <td>{b.tour?.title}</td>
                  <td>{b.tour?.price}</td>
                  <td>{new Date(b.created_at).toLocaleDateString('ru-RU')}</td>
                  <td>
                    <span className={`${styles.badge} ${statusClass[b.status]}`}>
                      {statusLabel[b.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <Link href="/admin/tours" style={{ textDecoration: 'none' }}>
          <div className={styles.statCard} style={{ cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>✈️</span>
            <div>
              <div style={{ color: '#fff', fontWeight: 600 }}>Управление турами</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Добавить / изменить</div>
            </div>
          </div>
        </Link>
        <Link href="/admin/users" style={{ textDecoration: 'none' }}>
          <div className={styles.statCard} style={{ cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>👥</span>
            <div>
              <div style={{ color: '#fff', fontWeight: 600 }}>Пользователи</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Роли / управление</div>
            </div>
          </div>
        </Link>
        <Link href="/admin/bookings" style={{ textDecoration: 'none' }}>
          <div className={styles.statCard} style={{ cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📋</span>
            <div>
              <div style={{ color: '#fff', fontWeight: 600 }}>Бронирования</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Подтвердить / отменить</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
