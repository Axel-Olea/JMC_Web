import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { FaOilCan, FaCarCrash, FaSearch } from 'react-icons/fa';
import styles from './TopServices.module.scss';

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

const services = [
  {
    icon: <FaOilCan className={styles.icon} />,
    title: 'Cambio de aceite',
    text: 'Servicio rápido, revisión de niveles y mantenimiento preventivo.',
  },
  {
    icon: <FaCarCrash className={styles.icon} />,
    title: 'Frenos y seguridad',
    text: 'Diagnóstico, cambio de pastillas y revisión de frenos ABS.',
  },
  {
    icon: <FaSearch className={styles.icon} />,
    title: 'Revisión general',
    text: 'Chequeo completo del vehículo para viajes o mantenimiento.',
  },
];

const TopServices = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <section className={styles.topServices} ref={ref}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionSubtitle}>Servicios destacados</span>
        <h2>Nuestros <span>servicios más solicitados</span></h2>
        <div className={styles.headerDivider}></div>
        <p>Confía en los servicios más requeridos por nuestros clientes. Calidad, rapidez y atención profesional.</p>
      </div>

      <div className={styles.servicesGrid}>
        {services.map((service, index) => (
          <motion.div
            className={styles.serviceCard}
            custom={index}
            initial="hidden"
            animate={controls}
            variants={cardVariants}
            key={index}
          >
            <div className={styles.iconBackground}></div>
            <div className={styles.iconContainer}>{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.text}</p>
            <div className={styles.cardHoverEffect}></div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TopServices;
