'use client'

import { useEffect, useState } from 'react';
import { MdCheckCircle, MdCancel, MdDelete, MdContactPhone, MdPhone, MdEmail, MdClose, MdHourglassEmpty } from 'react-icons/md';
import { FaTelegram } from 'react-icons/fa';
import styles from '../admin.module.css';

interface AdminBooking {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  created_at: string;
  user: { id: string; name: string; email: string; phone?: string };
  tour: { id: string; title: string; price: string; duration: string };
}

const statusLabel: Record<string, string> = { pending: 'Ожидает', confirmed: 'Подтверждено', cancelled: 'Отменено' };
const statusClass: Record<string, string> = { pending: styles.badgePending, confirmed: styles.badgeConfirmed, cancelled: styles.badgeCancelled };

function parseTelegram(notes?: string): string | null {
  return notes?.match(/Telegram: (@[\w]+)/)?.[1] ?? null;
}

function ContactModal({ booking, onClose }: { booking: AdminBooking; onClose: () => void }) {
  const telegram = parseTelegram(booking.notes);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Контакты клиента</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
            <MdClose size={24} />
          </button>
        </div>

        <div style={{ marginBottom: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Тур</div>
        <div style={{ color: '#fff', fontWeight: 600, marginBottom: '1.5rem' }}>{booking.tour?.title}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Имя</div>
            <div style={{ color: '#fff', fontWeight: 500 }}>{booking.user?.name}</div>
          </div>

          <a
            href={`mailto:${booking.user?.email}`}
            style={{ background: 'rgba(59,130,246,0.1)', borderRadius: '12px', padding: '1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <MdEmail size={20} color="#3b82f6" />
            <div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>Email</div>
              <div style={{ color: '#3b82f6', fontWeight: 500 }}>{booking.user?.email}</div>
            </div>
          </a>

          {booking.user?.phone ? (
            <a
              href={`tel:${booking.user.phone}`}
              style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '12px', padding: '1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              <MdPhone size={20} color="#22c55e" />
              <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>Телефон</div>
                <div style={{ color: '#22c55e', fontWeight: 500 }}>{booking.user.phone}</div>
              </div>
            </a>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MdPhone size={20} color="rgba(255,255,255,0.2)" />
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>Телефон не указан</div>
            </div>
          )}

          {telegram && (
            <a
              href={`https://t.me/${telegram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              style={{ background: 'rgba(0,136,204,0.1)', borderRadius: '12px', padding: '1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(0,136,204,0.2)' }}
            >
              <FaTelegram size={20} color="#0088cc" />
              <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>Telegram</div>
                <div style={{ color: '#0088cc', fontWeight: 500 }}>{telegram}</div>
              </div>
            </a>
          )}

          {booking.notes && (
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Детали заказа</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{booking.notes}</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          {telegram ? (
            <a
              href={`https://t.me/${telegram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}
            >
              Написать в Telegram
            </a>
          ) : (
            <a
              href={`mailto:${booking.user?.email}`}
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}
            >
              Написать на Email
            </a>
          )}
          {booking.user?.phone && (
            <a
              href={`tel:${booking.user.phone}`}
              className={`${styles.btn} ${styles.btnSuccess}`}
              style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}
            >
              Позвонить
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [contactBooking, setContactBooking] = useState<AdminBooking | null>(null);

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
                      <button
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                        onClick={() => setContactBooking(b)}
                        title="Контакты клиента"
                      >
                        <MdContactPhone size={16} />
                      </button>
                      {b.status !== 'confirmed' && (
                        <button
                          className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
                          onClick={() => handleStatus(b, 'confirmed')}
                          title="Подтвердить"
                        >
                          <MdCheckCircle size={16} />
                        </button>
                      )}
                      {b.status !== 'cancelled' && (
                        <button
                          className={`${styles.btn} ${styles.btnWarning} ${styles.btnSm}`}
                          onClick={() => handleStatus(b, 'cancelled')}
                          title="Отменить"
                        >
                          <MdCancel size={16} />
                        </button>
                      )}
                      {b.status === 'pending' && (
                        <button
                          className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                          style={{ opacity: 0.4, cursor: 'default' }}
                          title="Ожидает"
                          disabled
                        >
                          <MdHourglassEmpty size={16} />
                        </button>
                      )}
                      <button
                        className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                        onClick={() => handleDelete(b.id)}
                        title="Удалить"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {contactBooking && (
        <ContactModal booking={contactBooking} onClose={() => setContactBooking(null)} />
      )}
    </div>
  );
}
