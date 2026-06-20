'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './profile.module.css';
import { getCurrentUser, logout, updateUser } from '../utils/auth';
import type { User, Booking } from '../types/user';
import { FaCalendarAlt } from 'react-icons/fa';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', telegram: '' });

  useEffect(() => {
    const init = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) { router.push('/login'); return; }
      setUser(currentUser);
      setFormData({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone || '', telegram: currentUser.telegram || '' });

      const res = await fetch('/api/bookings');
      if (res.ok) {
        const json = await res.json();
        setBookings(json.bookings || []);
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const updated = await updateUser({ name: formData.name, phone: formData.phone, telegram: formData.telegram || undefined });
      setUser(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = async (key: 'notifications' | 'newsletter') => {
    if (!user) return;
    try {
      const updated = await updateUser({ [key]: !user[key] });
      setUser(updated);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const res = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
    if (res.ok) {
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const statusLabel: Record<string, string> = {
    pending: 'Ожидает подтверждения',
    confirmed: 'Подтверждено',
    cancelled: 'Отменено'
  };

  const statusClass: Record<string, string> = {
    pending: styles.statusPending,
    confirmed: styles.statusConfirmed,
    cancelled: styles.statusCancelled
  };

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (!user) return null;

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <Image src={user.avatar || '/default-avatar.svg'} alt={user.name} width={120} height={120} className={styles.avatar} />
            </div>
            <h1 className={styles.userName}>{user.name}</h1>
            <p className={styles.userEmail}>{user.email}</p>
            {user.role === 'admin' && <span className={styles.adminBadge}>Администратор</span>}
          </div>
        </div>

        <div className={styles.content}>
          <section className={styles.profileSection}>
            <div className={styles.sectionHeader}>
              <h2>Личные данные</h2>
              <button onClick={() => setIsEditing(!isEditing)} className={styles.editButton}>
                {isEditing ? 'Отменить' : 'Редактировать'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="name">Имя</label>
                  <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" name="email" value={formData.email} disabled className={styles.disabledInput} />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="phone">Телефон</label>
                  <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="telegram">Telegram</label>
                  <input id="telegram" type="text" name="telegram" value={formData.telegram} onChange={handleChange} placeholder="@username" />
                </div>
                <button type="submit" className={styles.saveButton}>Сохранить изменения</button>
              </form>
            ) : (
              <div className={styles.profileInfo}>
                <div className={styles.infoItem}><span className={styles.label}>Имя:</span><span>{user.name}</span></div>
                <div className={styles.infoItem}><span className={styles.label}>Email:</span><span>{user.email}</span></div>
                <div className={styles.infoItem}><span className={styles.label}>Телефон:</span><span>{user.phone || 'Не указан'}</span></div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Telegram:</span>
                  {user.telegram
                    ? <a href={`https://t.me/${user.telegram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>{user.telegram.startsWith('@') ? user.telegram : `@${user.telegram}`}</a>
                    : <span>Не указан</span>
                  }
                </div>
              </div>
            )}
          </section>

          <section className={styles.profileSection}>
            <h2>Мои бронирования</h2>
            <div className={styles.toursGrid}>
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <div key={booking.id} className={styles.tourCard}>
                    {booking.tour && (
                      <>
                        <div className={styles.tourImageWrapper}>
                          <Image src={booking.tour.image} alt={booking.tour.title} fill className={styles.tourImage} sizes="(max-width: 768px) 100vw, 50vw" />
                        </div>
                        <div className={styles.tourContent}>
                          <h3>{booking.tour.title}</h3>
                          <div className={styles.tourDetails}>
                            <span className={styles.tourPrice}>{booking.tour.price}</span>
                            <span className={styles.tourDuration}>{booking.tour.duration}</span>
                          </div>
                          <div className={styles.bookingDate}>
                            <FaCalendarAlt />
                            <span>Забронировано: {formatDate(booking.created_at)}</span>
                          </div>
                          <span className={`${styles.statusBadge} ${statusClass[booking.status]}`}>
                            {statusLabel[booking.status]}
                          </span>
                          {booking.status !== 'cancelled' && (
                            <button className={styles.cancelButton} onClick={() => handleCancelBooking(booking.id)}>
                              Отменить
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className={styles.emptyState}>У вас пока нет забронированных туров</p>
              )}
            </div>
          </section>

          <section className={styles.profileSection}>
            <h2>Настройки</h2>
            <div className={styles.preferences}>
              <div className={styles.preferenceItem}>
                <label className={styles.switch}>
                  <input type="checkbox" checked={user.notifications ?? true} onChange={() => handlePreferenceChange('notifications')} />
                  <span className={styles.slider}></span>
                </label>
                <div className={styles.preferenceInfo}>
                  <h3>Уведомления</h3>
                  <p>Получать уведомления о новых предложениях</p>
                </div>
              </div>
              <div className={styles.preferenceItem}>
                <label className={styles.switch}>
                  <input type="checkbox" checked={user.newsletter ?? true} onChange={() => handlePreferenceChange('newsletter')} />
                  <span className={styles.slider}></span>
                </label>
                <div className={styles.preferenceInfo}>
                  <h3>Рассылка</h3>
                  <p>Подписка на email-рассылку с новостями</p>
                </div>
              </div>
            </div>
          </section>

          <button onClick={handleLogout} className={styles.logoutButton}>Выйти из аккаунта</button>
        </div>
      </div>
    </div>
  );
}
