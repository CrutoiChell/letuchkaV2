'use client'

import { useEffect, useState } from 'react';
import { MdPerson, MdAdminPanelSettings, MdDelete } from 'react-icons/md';
import styles from '../admin.module.css';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin';
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRoleToggle = async (user: AdminUser) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Изменить роль ${user.name} на "${newRole}"?`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
    if (res.ok) load();
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`Удалить пользователя ${user.name}? Это также удалит все его бронирования.`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Поиск по имени или email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Пользователи ({filtered.length})</h2>
        </div>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>Пользователи не найдены</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Имя</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Роль</th>
                <th>Дата регистрации</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id}>
                  <td style={{ color: '#fff', fontWeight: 500 }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || '—'}</td>
                  <td>
                    <span className={`${styles.badge} ${user.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}`}>
                      {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString('ru-RU')}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={`${styles.btn} ${user.role === 'admin' ? styles.btnWarning : styles.btnSuccess} ${styles.btnSm}`}
                        onClick={() => handleRoleToggle(user)}
                        title={user.role === 'admin' ? 'Снять права' : 'Сделать админом'}
                      >
                        {user.role === 'admin' ? <MdPerson size={16} /> : <MdAdminPanelSettings size={16} />}
                      </button>
                      <button
                        className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                        onClick={() => handleDelete(user)}
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
    </div>
  );
}
