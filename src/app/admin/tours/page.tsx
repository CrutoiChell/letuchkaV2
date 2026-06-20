'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { MdEdit, MdDelete, MdVisibility, MdVisibilityOff, MdStar, MdUpload } from 'react-icons/md';
import styles from '../admin.module.css';
import type { Tour } from '../../types/user';

const CATEGORIES = ['popular', 'exotic', 'europe'] as const;
type Category = typeof CATEGORIES[number];
const catLabel: Record<string, string> = { popular: 'Популярные', exotic: 'Экзотика', europe: 'Европа' };

const emptyForm = {
  title: '',
  description: '',
  price: '',
  duration: '',
  image: '',
  category: 'popular' as Category,
  features: '',
  rating: '4.5',
  is_active: true,
};

export default function AdminTours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTour, setEditTour] = useState<Tour | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/tours').then(r => r.json()).then(d => setTours(d.tours || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditTour(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (tour: Tour) => {
    setEditTour(tour);
    setForm({
      title: tour.title,
      description: tour.description,
      price: tour.price,
      duration: tour.duration,
      image: tour.image,
      category: tour.category as Category,
      features: tour.features.join(', '),
      rating: String(tour.rating ?? '4.5'),
      is_active: tour.is_active ?? true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      features: form.features.split(',').map(f => f.trim()).filter(Boolean),
      rating: parseFloat(form.rating),
    };
    const url = editTour ? `/api/tours/${editTour.id}` : '/api/tours';
    const method = editTour ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) {
      setShowModal(false);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить тур?')) return;
    await fetch(`/api/tours/${id}`, { method: 'DELETE' });
    load();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: data });
    const json = await res.json();
    setUploading(false);
    if (res.ok) {
      setForm(f => ({ ...f, image: json.url }));
    } else {
      alert(json.message || 'Ошибка загрузки');
    }
    e.target.value = '';
  };

  const handleToggle = async (tour: Tour) => {
    await fetch(`/api/tours/${tour.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !tour.is_active })
    });
    load();
  };

  const filtered = tours.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Поиск по названию..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openCreate}>
          + Добавить тур
        </button>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Туры ({filtered.length})</h2>
        </div>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>Туры не найдены</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Фото</th>
                <th>Название</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>Длительность</th>
                <th>Рейтинг</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tour => (
                <tr key={tour.id}>
                  <td>
                    <Image
                      src={tour.image}
                      alt={tour.title}
                      width={60}
                      height={44}
                      className={styles.tourImage}
                    />
                  </td>
                  <td>
                    <div style={{ color: '#fff', fontWeight: 500 }}>{tour.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>
                      {tour.features.slice(0, 2).join(' · ')}
                    </div>
                  </td>
                  <td><span className={`${styles.badge} ${styles.badgeUser}`}>{catLabel[tour.category]}</span></td>
                  <td>{tour.price}</td>
                  <td>{tour.duration}</td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MdStar size={16} color="#f59e0b" /> {tour.rating}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${tour.is_active ? styles.badgeActive : styles.badgeInactive}`}>
                      {tour.is_active ? 'Активен' : 'Скрыт'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={`${styles.btn} ${styles.btnWarning} ${styles.btnSm}`} onClick={() => openEdit(tour)} title="Редактировать">
                        <MdEdit size={16} />
                      </button>
                      <button
                        className={`${styles.btn} ${tour.is_active ? styles.btnDanger : styles.btnSuccess} ${styles.btnSm}`}
                        onClick={() => handleToggle(tour)}
                        title={tour.is_active ? 'Скрыть' : 'Показать'}
                      >
                        {tour.is_active ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
                      </button>
                      <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => handleDelete(tour.id)} title="Удалить">
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

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>{editTour ? 'Редактировать тур' : 'Новый тур'}</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Название *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Магия Бали" />
              </div>
              <div className={styles.formGroup}>
                <label>Описание *</label>
                <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Описание тура..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>Цена *</label>
                  <input required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="от 120 000 ₽" />
                </div>
                <div className={styles.formGroup}>
                  <label>Длительность *</label>
                  <input required value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="12 дней" />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Изображение *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    required={!form.image}
                    value={form.image}
                    onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="/bali.jpg или загрузите файл"
                    style={{ flex: 1 }}
                  />
                  <label style={{ cursor: uploading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#334155', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0 1rem', color: '#fff', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                    <MdUpload size={16} />
                    {uploading ? 'Загрузка...' : 'Загрузить'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                  </label>
                </div>
                {form.image && form.image.startsWith('http') && (
                  <img src={form.image} alt="preview" style={{ marginTop: '0.5rem', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label>Категория *</label>
                  <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{catLabel[c]}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Рейтинг</label>
                  <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Особенности (через запятую)</label>
                <input value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder="Все включено, Экскурсии, Спа" />
              </div>
              <div className={styles.formGroup}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexDirection: 'row' }}>
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} style={{ width: 'auto', padding: 0 }} />
                  Активен (виден пользователям)
                </label>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={() => setShowModal(false)}>Отмена</button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
                  {saving ? 'Сохранение...' : editTour ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
