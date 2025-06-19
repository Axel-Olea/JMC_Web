import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { FaAward, FaUserShield, FaCarAlt, FaClock, FaTools } from 'react-icons/fa';
import { GiCarWheel } from 'react-icons/gi';
import styles from './WhyUsSection.module.scss';

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: 'easeOut'
    }
  })
};

const WhyUsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <section className={styles.whyUs} ref={ref}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionSubtitle}>Nuestras ventajas</span>
        <h2>¿Por qué elegir nuestro <span>servicentro mecánico?</span></h2>
        <div className={styles.headerDivider}></div>
        <p>Excelencia comprobada en cada servicio que realizamos</p>
      </div>

      <div className={styles.featuresGrid}>
        {[{
          icon: <FaAward className={styles.icon} />,
          title: 'Certificación Oficial',
          text: 'Mecánicos certificados por las principales marcas automotrices con más de 15 años de experiencia.'
        }, {
          icon: <FaUserShield className={styles.icon} />,
          title: 'Garantía Escrita',
          text: 'Todos nuestros servicios incluyen garantía por escrito. Tu tranquilidad es nuestra prioridad.'
        }, {
          icon: <FaCarAlt className={styles.icon} />,
          title: 'Tecnología de Punta',
          text: 'Equipos de diagnóstico computarizado para identificar problemas con precisión milimétrica.'
        }, {
          icon: <FaClock className={styles.icon} />,
          title: 'Servicio Rápido',
          text: '90% de las reparaciones se completan el mismo día. Tu tiempo es valioso.'
        }, {
          icon: <GiCarWheel className={styles.icon} />,
          title: 'Repuestos Originales',
          text: 'Trabajamos solo con repuestos de primera calidad y alternativas premium certificadas.'
        }, {
          icon: <FaTools className={styles.icon} />,
          title: 'Transparencia Total',
          text: 'Diagnóstico gratuito y presupuesto detallado antes de cualquier reparación.'
        }].map((card, index) => (
          <motion.div
            className={styles.featureCard}
            custom={index}
            initial="hidden"
            animate={controls}
            variants={cardVariants}
            key={index}
          >
            <div className={styles.iconBackground}></div>
            <div className={styles.iconContainer}>{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
            <div className={styles.cardHoverEffect}></div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className={styles.statsBanner}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
      >
        <div className={styles.statItem}>
          <span className={styles.statNumber}>1250+</span>
          <span className={styles.statLabel}>Clientes satisfechos</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>98%</span>
          <span className={styles.statLabel}>Satisfacción</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>24h</span>
          <span className={styles.statLabel}>Emergencias</span>
        </div>
      </motion.div>
    </section>
  );
};

export default WhyUsSection;
