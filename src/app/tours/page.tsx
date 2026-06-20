'use client'

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './tours.module.css';
import Image from 'next/image';
import type { Tour } from '../types/user';

// ──── helpers ────

function getNextMonths(count = 12) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + i);
    return {
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('ru-RU', { month: 'short' }),
      year: d.getFullYear(),
      monthNum: d.getMonth() + 1,
      isCurrentYear: d.getFullYear() === new Date().getFullYear(),
    };
  });
}

const MONTHS = getNextMonths(12);

// Seasonal multipliers (1 = base price from tour card)
const SEASON_MULT: Record<number, number> = {
  1: 0.9,   // Январь   — низкий сезон
  2: 0.85,  // Февраль  — самый дешёвый
  3: 1.0,   // Март
  4: 1.1,   // Апрель
  5: 1.2,   // Май
  6: 1.35,  // Июнь     — высокий сезон
  7: 1.45,  // Июль     — пик
  8: 1.4,   // Август   — пик
  9: 1.25,  // Сентябрь — бархатный
  10: 1.05, // Октябрь
  11: 0.9,  // Ноябрь   — низкий
  12: 1.1,  // Декабрь  — праздники
};

const SEASON_LABEL: Record<number, string> = {
  1: 'низкий сезон', 2: 'низкий сезон',
  3: 'межсезонье', 4: 'межсезонье', 5: 'межсезонье',
  10: 'межсезонье', 11: 'низкий сезон',
  6: 'высокий сезон', 7: 'пик сезона', 8: 'пик сезона',
  9: 'бархатный сезон',
  12: 'праздничный сезон',
};

function extractBasePrice(text: string): number {
  // "от 120 000 ₽" → 120000
  return parseInt(text.replace(/\D/g, '')) || 0;
}

function calcTotal(tour: Tour, travelers: number, monthNum: number): number {
  const base = extractBasePrice(tour.price);
  const mult = SEASON_MULT[monthNum] ?? 1;
  return Math.round((base * travelers * mult) / 1000) * 1000;
}

function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₽';
}

// ──── Booking Modal ────

function BookingModal({ tour, onClose, onConfirm }: {
  tour: Tour;
  onClose: () => void;
  onConfirm: (data: { month: string; travelers: number; notes: string }) => Promise<void>;
}) {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[1].value);
  const [travelers, setTravelers] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const monthObj = MONTHS.find(m => m.value === selectedMonth)!;
  const total = calcTotal(tour, travelers, monthObj.monthNum);
  const season = SEASON_LABEL[monthObj.monthNum] ?? '';
  const multiplierLabel = SEASON_MULT[monthObj.monthNum] > 1
    ? `+${Math.round((SEASON_MULT[monthObj.monthNum] - 1) * 100)}% (${season})`
    : SEASON_MULT[monthObj.monthNum] < 1
      ? `−${Math.round((1 - SEASON_MULT[monthObj.monthNum]) * 100)}% (${season})`
      : season;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm({ month: selectedMonth, travelers, notes });
    setLoading(false);
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.bookingModal}>
          <div className={styles.successScreen}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Заявка принята!</h2>
            <p className={styles.successText}>
              Наш специалист свяжется с вами в ближайшее время, обсудит детали тура
              <strong> «{tour.title}»</strong> и расскажет об удобных способах оплаты.
            </p>
            <div className={styles.successDetails}>
              <div className={styles.successDetailRow}>
                <span>Отъезд</span>
                <strong>
                  {new Date(selectedMonth + '-01').toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                </strong>
              </div>
              <div className={styles.successDetailRow}>
                <span>Туристов</span>
                <strong>{travelers} чел.</strong>
              </div>
              <div className={styles.successDetailRow}>
                <span>Примерная сумма</span>
                <strong className={styles.successPrice}>{formatPrice(total)}</strong>
              </div>
            </div>
            <p className={styles.successNote}>
              💬 Оплата обсуждается индивидуально с менеджером
            </p>
            <button className={styles.confirmBtn} onClick={onClose} style={{ width: '100%' }}>
              Перейти в профиль →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.bookingModal}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>

        {/* Tour banner */}
        <div className={styles.bookingHeader}>
          <div className={styles.bookingImageWrap}>
            <Image src={tour.image} alt={tour.title} fill className={styles.bookingImage} />
            <div className={styles.bookingImageOverlay} />
          </div>
          <div className={styles.bookingTourInfo}>
            <h2 className={styles.bookingTitle}>{tour.title}</h2>
            <div className={styles.bookingMeta}>
              <span>⏱ {tour.duration}</span>
              <span>⭐ {tour.rating ?? 4.5}</span>
              <span className={styles.bookingPrice}>{tour.price} / чел.</span>
            </div>
          </div>
        </div>

        <div className={styles.bookingBody}>
          {/* Month picker */}
          <div className={styles.bookingSection}>
            <h3 className={styles.bookingSectionTitle}>📅 Месяц отъезда</h3>
            <div className={styles.monthGrid}>
              {MONTHS.map(m => {
                const mult = SEASON_MULT[m.monthNum] ?? 1;
                const isHigh = mult >= 1.3;
                const isLow  = mult <= 0.9;
                return (
                  <button
                    key={m.value}
                    className={`${styles.monthPill} ${selectedMonth === m.value ? styles.monthPillActive : ''} ${isHigh ? styles.monthPillHigh : ''} ${isLow ? styles.monthPillLow : ''}`}
                    onClick={() => setSelectedMonth(m.value)}
                    title={SEASON_LABEL[m.monthNum]}
                  >
                    <span className={styles.monthName}>{m.label}</span>
                    {!m.isCurrentYear && <span className={styles.monthYear}>{m.year}</span>}
                  </button>
                );
              })}
            </div>
            <div className={styles.monthLegend}>
              <span className={styles.legendLow}>● дешевле</span>
              <span className={styles.legendNeutral}>● обычная цена</span>
              <span className={styles.legendHigh}>● дороже</span>
            </div>
          </div>

          {/* Travelers */}
          <div className={styles.bookingSection}>
            <h3 className={styles.bookingSectionTitle}>👥 Количество туристов</h3>
            <div className={styles.travelersRow}>
              <button
                className={styles.travelerBtn}
                onClick={() => setTravelers(t => Math.max(1, t - 1))}
                disabled={travelers <= 1}
              >−</button>
              <span className={styles.travelersCount}>{travelers}</span>
              <button
                className={styles.travelerBtn}
                onClick={() => setTravelers(t => Math.min(20, t + 1))}
              >+</button>
              <span className={styles.travelersLabel}>
                {travelers === 1 ? 'турист' : travelers < 5 ? 'туриста' : 'туристов'}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className={styles.bookingSection}>
            <h3 className={styles.bookingSectionTitle}>💬 Пожелания</h3>
            <textarea
              className={styles.bookingNotes}
              placeholder="Особые пожелания, предпочтения по отелю, аллергии..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Footer: total + actions */}
        <div className={styles.bookingFooter}>
          <div className={styles.totalBlock}>
            <div className={styles.totalRow}>
              <div className={styles.totalCalc}>
                <span className={styles.totalCalcItem}>
                  {formatPrice(extractBasePrice(tour.price))} × {travelers} чел.
                </span>
                {multiplierLabel && (
                  <span className={`${styles.totalCalcItem} ${SEASON_MULT[monthObj.monthNum] >= 1.3 ? styles.totalCalcHigh : SEASON_MULT[monthObj.monthNum] <= 0.9 ? styles.totalCalcLow : styles.totalCalcNeutral}`}>
                    {multiplierLabel}
                  </span>
                )}
              </div>
              <div className={styles.totalAmount}>
                <span className={styles.totalLabel}>Итого ~</span>
                <span className={styles.totalValue}>{formatPrice(total)}</span>
              </div>
            </div>
            <p className={styles.totalNote}>Точная стоимость обсуждается с менеджером</p>
          </div>

          <div className={styles.bookingActions}>
            <button className={styles.cancelBtn} onClick={onClose}>Отмена</button>
            <button className={styles.confirmBtn} onClick={handleConfirm} disabled={loading}>
              {loading ? 'Оформляем...' : '✈ Забронировать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──── Tours page ────

function ToursContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<'all' | 'popular' | 'exotic' | 'europe'>('all');
  const [hoveredTour, setHoveredTour] = useState<string | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingTour, setBookingTour] = useState<Tour | null>(null);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      const map: Record<string, 'popular' | 'exotic' | 'europe'> = {
        'солнечная греция': 'popular',
        'магическая италия': 'europe',
        'экзотический таиланд': 'exotic'
      };
      if (map[category]) setActiveCategory(map[category]);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const url = activeCategory === 'all' ? '/api/tours' : `/api/tours?category=${activeCategory}`;
    fetch(url)
      .then(r => r.json())
      .then(data => setTours(data.tours || []))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const handleBookingClick = async (tour: Tour) => {
    const res = await fetch('/api/auth/me');
    if (!res.ok) { router.push('/login'); return; }
    setBookingTour(tour);
  };

  const handleConfirmBooking = async ({ month, travelers, notes }: { month: string; travelers: number; notes: string }) => {
    if (!bookingTour) return;
    const formattedMonth = new Date(month + '-01').toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
    const notesText = [
      `Месяц отъезда: ${formattedMonth}`,
      `Туристов: ${travelers}`,
      notes ? `Пожелания: ${notes}` : ''
    ].filter(Boolean).join('\n');

    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tourId: bookingTour.id, notes: notesText })
    });
  };

  const handleModalClose = () => {
    setBookingTour(null);
    router.push('/profile');
  };

  const CATEGORIES = [
    { key: 'all',     label: 'Все туры' },
    { key: 'popular', label: 'Популярные' },
    { key: 'exotic',  label: 'Экзотика' },
    { key: 'europe',  label: 'Европа' },
  ] as const;

  return (
    <div className={styles.toursPage}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Наши туры</h1>
            <p className={styles.subtitle}>Откройте для себя удивительные направления и незабываемые впечатления</p>
          </div>
        </section>

        <section className={styles.categories}>
          <div className={styles.categoryButtons}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`${styles.categoryButton} ${activeCategory === cat.key ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className={styles.loading}>Загружаем туры...</div>
        ) : tours.length === 0 ? (
          <div className={styles.loading}>По вашему запросу туров не найдено</div>
        ) : (
          <section className={styles.toursGrid}>
            {tours.map((tour) => (
              <div
                key={tour.id}
                className={`${styles.tourCard} ${hoveredTour === tour.id ? styles.hovered : ''}`}
                onMouseEnter={() => setHoveredTour(tour.id)}
                onMouseLeave={() => setHoveredTour(null)}
              >
                <div className={styles.tourImageWrapper}>
                  <Image
                    src={tour.image}
                    alt={tour.title}
                    fill
                    className={styles.tourImage}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {tour.rating && (
                    <div className={styles.tourRatingBadge}>⭐ {tour.rating}</div>
                  )}
                </div>
                <div className={styles.tourContent}>
                  <h3 className={styles.tourTitle}>{tour.title}</h3>
                  <p className={styles.tourDescription}>{tour.description}</p>
                  <div className={styles.tourDetails}>
                    <span className={styles.tourPrice}>{tour.price}</span>
                    <span className={styles.tourDuration}>⏱ {tour.duration}</span>
                  </div>
                  <div className={styles.tourFeatures}>
                    {tour.features.map((feature, idx) => (
                      <span key={idx} className={styles.feature}>{feature}</span>
                    ))}
                  </div>
                  <button className={styles.bookButton} onClick={() => handleBookingClick(tour)}>
                    Забронировать →
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {bookingTour && (
          <BookingModal
            tour={bookingTour}
            onClose={handleModalClose}
            onConfirm={handleConfirmBooking}
          />
        )}

        <section className={styles.callToAction}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Не нашли подходящий тур?</h2>
            <p className={styles.ctaText}>Мы подберём маршрут специально под вас — напишите нам</p>
            <a href="/contacts" className={styles.ctaButton}>Связаться с нами</a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Tours() {
  return (
    <Suspense fallback={<div className={styles.loading}>Загрузка...</div>}>
      <ToursContent />
    </Suspense>
  );
}
