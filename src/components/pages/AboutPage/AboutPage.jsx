import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './AboutPage.module.scss';
import teamImage from '/images/teamImage.webp';
import logo from '../../../assets/logo-jmc.png';
import Header from '../../sections/Header/Header';
import Footer from '../../sections/Footer';


const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.2,
      duration: 0.8,
      ease: 'easeOut'
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 }
};

const AboutPage = () => {
   const navigate = useNavigate();
   
  return (
     <>
      <Header />
      <div className={styles.aboutPage}>
     

      <main className={styles.mainContent}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Nuestra Historia
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
            >
                Más de 15 años ofreciendo servicios mecánicos de excelencia
            </motion.p>
          </div>
        </section>

        {/* About Content */}
        <motion.section
          className={styles.aboutContent}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className={styles.aboutContainer}>
            <div className={styles.textContent}>
              <h2>Expertos en Servicio Automotriz</h2>
              <p>
                En <strong>JMC Servicios Mecánicos</strong>, nos enorgullecemos de ofrecer
                soluciones integrales para el mantenimiento y reparación de su vehículo.
                Fundado en 2008, nuestro taller ha crecido gracias a la confianza
                de nuestros clientes y nuestro compromiso con la calidad.
              </p>

              <h3>Nuestra Filosofía</h3>
              <p>
                Creemos en la honestidad, transparencia y trabajo bien hecho. Cada vehículo
                que entra en nuestro taller recibe la misma atención meticulosa, ya sea
                un auto familiar o un vehículo de alto rendimiento.
              </p>
            </div>

            <div className={styles.imageContent}>
              <img
                src={teamImage}
                alt="Nuestro equipo de mecánicos"
                className={styles.teamImage}
              />
            </div>
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section
          className={styles.valuesSection}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2>Lo Que Nos Define</h2>
          <motion.div className={styles.valuesGrid}>
            <motion.div className={styles.valueCard} variants={itemVariants}>
              <div className={styles.valueIcon}>🔧</div>
              <h3>Experiencia</h3>
              <p>Mecánicos certificados con más de 10 años de experiencia promedio</p>
            </motion.div>

            <motion.div className={styles.valueCard} variants={itemVariants}>
              <div className={styles.valueIcon}>🛠️</div>
              <h3>Equipo Moderno</h3>
              <p>Tecnología de diagnóstico y herramientas de última generación</p>
            </motion.div>

            <motion.div className={styles.valueCard} variants={itemVariants}>
              <div className={styles.valueIcon}>⭐</div>
              <h3>Garantía</h3>
              <p>Todos nuestros trabajos están respaldados por garantía escrita</p>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className={styles.ctaSection}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className={styles.ctaContainer}>
            <img src={logo} alt="Logo JMC" className={styles.ctaLogo} />
            <h2>¿Listo para experimentar la diferencia JMC?</h2>
            <p>Agenda una cita hoy mismo y descubre por qué somos el taller de confianza de cientos de clientes</p>
            <button onClick={() => navigate('/appointment')} className={styles.ctaButton}>Agendar una cita</button>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
    </>
  );
};

export default AboutPage;
