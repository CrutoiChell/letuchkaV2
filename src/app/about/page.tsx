'use client'

import { useEffect, useState, useCallback } from 'react';
import styles from './about.module.css';
import Image from 'next/image';

interface Stat {
  number: string;
  label: string;
}

interface TeamMember {
  name: string;
  position: string;
  image: string;
  description: string;
}

const stats: Stat[] = [
  { number: '11+', label: 'Лет опыта' },
  { number: '50+', label: 'Направлений' },
  { number: '10k+', label: 'Довольных клиентов' },
  { number: '98%', label: 'Положительных отзывов' },
];

const teamMembers: TeamMember[] = [
  {
    name: 'Баель',
    position: 'Генеральный директор',
    image: '/director.jpg',
    description: 'Более 16 лет опыта в туристической индустрии. Создала компанию с нуля и развила ее до лидирующих позиций на рынке.'
  },
  {
    name: 'Алексей',
    position: 'Руководитель направления Азия',
    image: '/asia-lead.jpg',
    description: 'Эксперт по странам Азии. Лично посетил более 30 стран региона и знает все секреты организации идеального отдыха.'
  },
  {
    name: 'Павел',
    position: 'Руководитель направления Европа',
    image: '/europe-lead.jpg',
    description: 'Специализируется на европейских турах. Создает уникальные маршруты, сочетающие популярные места и скрытые жемчужины.'
  }
];

export default function About() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      setVisibleSections(prev => {
        const newSet = new Set(prev);
        if (entry.isIntersecting) {
          newSet.add(entry.target.id);
        }
        return newSet;
      });
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px'
    });

    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => observer.observe(section));

    return () => {
      sections.forEach(section => observer.unobserve(section));
      observer.disconnect();
    };
  }, [handleIntersection]);

  const isVisible = (sectionId: string) => visibleSections.has(sectionId);

  return (
    <div className={styles.aboutPage}>
      <div className={styles.container}>
        <section id="hero" className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>О нашей компании</h1>
            <p className={styles.subtitle}>
              Мы создаем незабываемые путешествия и яркие впечатления уже более 11 лет
            </p>
          </div>
        </section>

        <section 
          id="mission" 
          className={`${styles.section} ${styles.mission} ${
            isVisible('mission') ? styles.visible : ''
          }`}
        >
          <div className={styles.missionContent}>
            <h2 className={styles.sectionTitle}>Наша миссия</h2>
            <p className={styles.missionText}>
              Мы стремимся сделать путешествия доступными и незабываемыми для каждого. 
              Наша цель - не просто организовать поездку, а создать историю, которую вы будете 
              помнить всю жизнь. Мы верим, что путешествия расширяют горизонты и меняют жизнь к лучшему.
            </p>
          </div>
        </section>

        <section 
          id="stats" 
          className={`${styles.section} ${styles.stats} ${
            isVisible('stats') ? styles.visible : ''
          }`}
        >
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <span className={styles.statNumber}>{stat.number}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section 
          id="team" 
          className={`${styles.section} ${styles.team} ${
            isVisible('team') ? styles.visible : ''
          }`}
        >
          <h2 className={styles.sectionTitle}>Наша команда</h2>
          <div className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <div key={index} className={styles.teamMember}>
                <div className={styles.memberImageWrapper}>
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className={styles.memberImage}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className={styles.memberInfo}>
                  <h3 className={styles.memberName}>{member.name}</h3>
                  <span className={styles.memberPosition}>{member.position}</span>
                  <p className={styles.memberDescription}>{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section 
          id="values" 
          className={`${styles.section} ${styles.values} ${
            isVisible('values') ? styles.visible : ''
          }`}
        >
          <h2 className={styles.sectionTitle}>Наши ценности</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <h3>Качество</h3>
              <p>Мы не идем на компромиссы когда дело касается качества услуг и впечатлений наших клиентов</p>
            </div>
            <div className={styles.valueCard}>
              <h3>Надежность</h3>
              <p>Мы всегда выполняем свои обещания и заботимся о безопасности наших путешественников</p>
            </div>
            <div className={styles.valueCard}>
              <h3>Инновации</h3>
              <p>Постоянно следим за трендами и внедряем новые технологии для улучшения сервиса</p>
            </div>
            <div className={styles.valueCard}>
              <h3>Персонализация</h3>
              <p>Создаем индивидуальные маршруты, учитывая все пожелания и предпочтения клиентов</p>
            </div>
          </div>
        </section>

        <section 
          id="contact" 
          className={`${styles.section} ${styles.contact} ${
            isVisible('contact') ? styles.visible : ''
          }`}
        >
          <div className={styles.contactContent}>
            <h2 className={styles.sectionTitle}>Свяжитесь с нами</h2>
            <p className={styles.contactText}>
              Готовы обсудить ваше следующее путешествие? Наши эксперты всегда рады помочь!
            </p>
            <button className={styles.contactButton}>
              Написать нам
            </button>
          </div>
        </section>
      </div>
    </div>
  );
} 