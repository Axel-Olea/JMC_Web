import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import styles from './AboutUs.module.scss';

const AboutUs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({ opacity: 1, y: 0 });
    }
  }, [isInView, controls]);

  return (
    <section className={styles.aboutUs} ref={ref}>
      <motion.div
        className={styles.contentWrapper}
        initial={{ opacity: 0, y: 50 }}
        animate={controls}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className={styles.imageContainer}>
          <img src="/images/teamImage.webp" alt="Nuestro equipo" />
        </div>
        <div className={styles.textContainer}>
          <span className={styles.subtitle}>Quiénes somos</span>
          <h2>Tu equipo mecánico de confianza</h2>
          <p>
            Somos un equipo apasionado por los autos y comprometido con brindar soluciones honestas, eficientes y de alta calidad. 
            Cada reparación, revisión o mantención es realizada con profesionalismo, tecnología y experiencia.
          </p>
          <p>
            Nos enorgullece ser un taller cercano a las personas, con una atención transparente, responsable y con garantía. 
            Tu vehículo estará en manos expertas.
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default AboutUs;
