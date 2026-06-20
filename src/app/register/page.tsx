'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './register.module.css';
import { register } from '../utils/auth';
import type { RegisterData } from '../types/user';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterData>({ email: '', password: '', name: '', phone: '' });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      router.push('/profile');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Регистрация</h1>
          <p className={styles.subtitle}>Создайте аккаунт для доступа ко всем возможностям</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="name">Имя</label>
              <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Введите ваше имя" />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Введите ваш email" />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Пароль</label>
              <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Создайте пароль" minLength={6} />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="phone">Телефон (необязательно)</label>
              <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+7 (___) ___-__-__" />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>

            <div className={styles.loginLink}>
              Уже есть аккаунт?{' '}
              <Link href="/login">Войти</Link>
            </div>
          </form>
        </div>

        <div className={styles.features}>
          <h2>Преимущества регистрации</h2>
          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🎯</div>
              <h3>Персональные предложения</h3>
              <p>Получайте специальные предложения на основе ваших интересов</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🔔</div>
              <h3>Уведомления о скидках</h3>
              <p>Узнавайте первыми о выгодных предложениях и акциях</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>⭐</div>
              <h3>Избранные направления</h3>
              <p>Сохраняйте понравившиеся туры и следите за изменением цен</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
