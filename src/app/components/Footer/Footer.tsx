import Link from 'next/link'
import Image from 'next/image'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.company}>
            <h3>Летучка</h3>
            <p>Организуем незабываемые путешествия по всему миру</p>
          </div>
          
          <div className={styles.links}>
            <div className={styles.section}>
              <h4>Навигация</h4>
              <Link href="/">Главная</Link>
              <Link href="/tours">Туры</Link>
              <Link href="/about">О нас</Link>
              <Link href="/contacts">Контакты</Link>
            </div>
            
            <div className={styles.section}>
              <h4>Контакты</h4>
              <div className={styles.contactItem}>
                <Image src="/phone.svg" alt="Телефон" width={16} height={16} />
                <span>+7 (999) 123-45-67</span>
              </div>
              <div className={styles.contactItem}>
                <Image src="/email.svg" alt="Email" width={16} height={16} />
                <span>info@travel.com</span>
              </div>
              <div className={styles.contactItem}>
                <Image src="/location.svg" alt="Адрес" width={16} height={16} />
                <span>г. Москва, ул. Примерная, 1</span>
              </div>
            </div>
          </div>

          <div className={styles.social}>
            <h4>Мы в соцсетях</h4>
            <div className={styles.socialLinks}>
              <Link href="https://t.me/travelagency" target="_blank">
                <Image src="/telegram.svg" alt="Telegram" width={24} height={24} />
              </Link>
              <Link href="https://vk.com/travelagency" target="_blank">
                <Image src="/vk.svg" alt="VK" width={24} height={24} />
              </Link>
              <Link href="https://wa.me/79991234567" target="_blank">
                <Image src="/whatsapp.svg" alt="WhatsApp" width={24} height={24} />
              </Link>
            </div>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p>© 2026 Летучка. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
} 