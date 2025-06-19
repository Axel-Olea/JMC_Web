// src/sections/ScheduleSection.jsx
import React, { useRef, useEffect } from 'react';
import styles from './ScheduleSection.module.scss';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ScheduleSection = () => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const navigate = useNavigate();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const handleClick = () => {
    navigate('/appointment');  // Ajusta según la ruta real de la página de agendamiento
  };

  return (
    <section className={styles.scheduleSection} ref={ref}>
      <motion.div
        className={styles.container}
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
          }
        }}
      >
        <h2>¿Necesitas agendar una hora?</h2>
        <p>Reserva tu cita con nuestro taller de forma rápida y sencilla.</p>
        <motion.button 
          className={styles.scheduleButton}
          whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(163, 4, 4, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/appointment')}
        >
          Agendar Hora
        </motion.button>
      </motion.div>
    </section>
  );
};

export default ScheduleSection;
