'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';
import { login } from '../utils/auth';
import type { LoginData } from '../types/user';
import { HiOutlineSparkles, HiOutlineCalendar, HiOutlineGift } from 'react-icons/hi';

type Errors = Partial<Record<keyof LoginData, string>>;

function validate(data: LoginData): Errors {
  const errors: Errors = {};

  if (!data.email.trim()) {
    errors.email = 'Введите email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Введите корректный email';
  }

  if (!data.password) {
    errors.password = 'Введите пароль';
  } else if (data.password.length < 6) {
    errors.password = 'Пароль должен содержать минимум 6 символов';
  }

  return errors;
}

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginData>({ email: '', password: '' });
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
      await login(formData);
      router.push('/profile');
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const fieldErrors = validate(formData);
    setErrors(prev => ({ ...prev, [name]: fieldErrors[name as keyof LoginData] ?? '' }));
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Вход в аккаунт</h1>
          <p className={styles.subtitle}>Войдите, чтобы получить доступ к вашим путешествиям</p>

          <form onSubmit={handleSubmit} className={styles.form}>
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
                placeholder="Введите пароль"
                className={errors.password ? styles.inputError : ''}
              />
              {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
            </div>

            {serverError && <div className={styles.error}>{serverError}</div>}

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </button>

            <div className={styles.registerLink}>
              Нет аккаунта?{' '}
              <Link href="/register">Зарегистрироваться</Link>
            </div>
          </form>
        </div>

        <div className={styles.welcomeSection}>
          <h2>Добро пожаловать!</h2>
          <div className={styles.benefits}>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}><HiOutlineSparkles size={32} /></div>
              <h3>Эксклюзивные предложения</h3>
              <p>Доступ к специальным ценам и акциям для участников</p>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}><HiOutlineCalendar size={32} /></div>
              <h3>История поездок</h3>
              <p>Отслеживайте все ваши бронирования в одном месте</p>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}><HiOutlineGift size={32} /></div>
              <h3>Бонусная программа</h3>
              <p>Накапливайте баллы и обменивайте их на путешествия</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
