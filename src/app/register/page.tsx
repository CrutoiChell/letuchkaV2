'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './register.module.css';
import { register } from '../utils/auth';
import type { RegisterData } from '../types/user';
import { FiBell, FiStar, FiTarget } from 'react-icons/fi';

type Errors = Partial<Record<keyof RegisterData, string>>;

function validate(data: RegisterData): Errors {
  const errors: Errors = {};

  const name = data.name.trim();
  if (!name) {
    errors.name = 'Введите имя';
  } else if (name.length < 2) {
    errors.name = 'Имя должно содержать минимум 2 символа';
  } else if (name.length > 50) {
    errors.name = 'Имя не должно превышать 50 символов';
  } else if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(name)) {
    errors.name = 'Имя должно содержать только буквы';
  }

  if (!data.email.trim()) {
    errors.email = 'Введите email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Введите корректный email';
  }

  if (!data.password) {
    errors.password = 'Введите пароль';
  } else if (data.password.length < 8) {
    errors.password = 'Пароль должен содержать минимум 8 символов';
  } else if (!/[a-zA-Zа-яА-ЯёЁ]/.test(data.password)) {
    errors.password = 'Пароль должен содержать хотя бы одну букву';
  } else if (!/\d/.test(data.password)) {
    errors.password = 'Пароль должен содержать хотя бы одну цифру';
  }

  if (data.phone) {
    const digits = data.phone.replace(/\D/g, '');
    const valid = (digits.length === 11 && /^[78]/.test(digits)) || digits.length === 10;
    if (!valid) errors.phone = 'Введите корректный номер телефона';
  }

  return errors;
}

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterData>({ email: '', password: '', name: '', phone: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setServerError('');
    setLoading(true);
    try {
      await register(formData);
      router.push('/profile');
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const fieldErrors = validate(formData);
    setErrors(prev => ({ ...prev, [name]: fieldErrors[name as keyof RegisterData] ?? '' }));
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
              <input
                id="name" type="text" name="name"
                value={formData.name} onChange={handleChange} onBlur={handleBlur}
                placeholder="Введите ваше имя"
                className={errors.name ? styles.inputError : ''}
              />
              {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email" type="email" name="email"
                value={formData.email} onChange={handleChange} onBlur={handleBlur}
                placeholder="Введите ваш email"
                className={errors.email ? styles.inputError : ''}
              />
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Пароль</label>
              <input
                id="password" type="password" name="password"
                value={formData.password} onChange={handleChange} onBlur={handleBlur}
                placeholder="Минимум 8 символов, буква и цифра"
                className={errors.password ? styles.inputError : ''}
              />
              {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="phone">Телефон (необязательно)</label>
              <input
                id="phone" type="tel" name="phone"
                value={formData.phone} onChange={handleChange} onBlur={handleBlur}
                placeholder="+7 (___) ___-__-__"
                className={errors.phone ? styles.inputError : ''}
              />
              {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
            </div>

            {serverError && <div className={styles.error}>{serverError}</div>}

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
              <div className={styles.featureIcon}><FiTarget size={32} /></div>
              <h3>Персональные предложения</h3>
              <p>Получайте специальные предложения на основе ваших интересов</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><FiBell size={32} /></div>
              <h3>Уведомления о скидках</h3>
              <p>Узнавайте первыми о выгодных предложениях и акциях</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><FiStar size={32} /></div>
              <h3>Избранные направления</h3>
              <p>Сохраняйте понравившиеся туры и следите за изменением цен</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
