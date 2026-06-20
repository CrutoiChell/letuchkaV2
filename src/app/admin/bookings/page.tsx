'use client'

import { useEffect, useState } from 'react';
import styles from '../admin.module.css';

interface AdminBooking {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  created_at: string;
  user: { id: string; name: string; email: string };
  tour: { id: string; title: string; price: string; duration: string };
}

const statusLabel: Record<string, string> = { pending: 'Ожидает', confirmed: 'Подтверждено', cancelled: 'Отменено' };
const statusClass: Record<string, string> = { pending: styles.badgePending, confirmed: styles.badgeConfirmed, cancelled: styles.badgeCancelled };

export default function AdminBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/bookings').then(r => r.json()).then(d => setBookings(d.bookings || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatus = async (booking: AdminBooking, status: string) => {
    const res = await fetch(`/api/admin/bookings/${booking.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить бронирование?')) return;
    const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  const filtered = bookings.filter(b => {
    const matchSearch =
      b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.tour?.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Поиск по клиенту или туру..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', padding: '0.7rem 1rem', fontSize: '0.9rem', minWidth: '180px' }}
        >
          <option value="all">Все статусы</option>
          <option value="pending">Ожидают</option>
          <option value="confirmed">Подтверждённые</option>
          <option value="cancelled">Отменённые</option>
        </select>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Бронирования ({filtered.length})</h2>
        </div>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>Бронирования не найдены</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Тур</th>
                <th>Цена</th>
                <th>Длительность</th>
                <th>Дата</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td>
                    <div style={{ color: '#fff', fontWeight: 500 }}>{b.user?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{b.user?.email}</div>
                  </td>
                  <td>{b.tour?.title}</td>
                  <td>{b.tour?.price}</td>
                  <td>{b.tour?.duration}</td>
                  <td>{new Date(b.created_at).toLocaleDateString('ru-RU')}</td>
                  <td>
                    <span className={`${styles.badge} ${statusClass[b.status]}`}>
                      {statusLabel[b.status]}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {b.status !== 'confirmed' && (
                        <button
                          className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
                          onClick={() => handleStatus(b, 'confirmed')}
                          title="Подтвердить"
                        >✅</button>
                      )}
                      {b.status !== 'cancelled' && (
                        <button
                          className={`${styles.btn} ${styles.btnWarning} ${styles.btnSm}`}
                          onClick={() => handleStatus(b, 'cancelled')}
                          title="Отменить"
                        >❌</button>
                      )}
                      {b.status === 'pending' && (
                        <button
                          className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                          onClick={() => handleStatus(b, 'pending')}
                          style={{ opacity: 0.5, cursor: 'default' }}
                          title="Ожидает"
                        >⏳</button>
                      )}
                      <button
                        className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                        onClick={() => handleDelete(b.id)}
                        title="Удалить"
                      >🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
