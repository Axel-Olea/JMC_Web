import React from 'react';
import { motion } from 'framer-motion';
import styles from './Footer.module.scss';
import { FaFacebook, FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.3 }}
      className={styles.footer}
    >
      <div className={styles.footerContent}>
        <div className={styles.footerColumn}>
          <h3 className={styles.footerTitle}>Contacto</h3>
          <ul className={styles.footerList}>
            <li>
              <FaMapMarkerAlt className={styles.icon} />
              <span>San José 495, Maipú, Santiago</span>
            </li>
            <li>
              <FaPhone className={styles.icon} />
              <span>+56 9 6662 1072</span>
            </li>
            <li>
              <FaEnvelope className={styles.icon} />
              <span>contacto@jmcrepair.cl</span>
            </li>
            <li>
              <FaClock className={styles.icon} />
              <span>Lunes a Viernes: 9:00 - 18:00 hrs
                <p>Sábado: 9:00 - 14:00 hrs</p>
              </span>
            </li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h3 className={styles.footerTitle}>Servicios</h3>
          <ul className={styles.footerList}>
            <li>Mantenimiento preventivo</li>
            <li>Reparación de frenos</li>
            <li>Diagnóstico computarizado</li>
            <li>Alineación y balanceo</li>
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h3 className={styles.footerTitle}>Síguenos</h3>
          <div className={styles.socialIcons}>
            <a href="#" className={styles.socialLink} aria-label="Facebook">
              <FaFacebook className={styles.socialIcon} />
            </a>
            <a href="https://www.instagram.com/jmc.repair/#" 
              className={styles.socialLink} 
              aria-label="Instagram"
              target="_blank"
              >
              <FaInstagram className={styles.socialIcon} />
            </a>
            <a 
              href={`https://wa.me/56966621072?text=${encodeURIComponent('Hola, me interesa información sobre sus servicios')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="WhatsApp"
            >
              <FaWhatsapp className={styles.socialIcon} />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.copyright}>
        <p>© 2025 JMC Repair - Todos los derechos reservados</p>
      </div>
    </motion.footer>
  );
};

export default Footer;
