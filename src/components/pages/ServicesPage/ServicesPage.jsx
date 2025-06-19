import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ServicesPage.module.scss';
import { 
  FaTools, FaCarCrash, FaCarAlt, FaCarBattery, 
  FaWrench, FaShoppingCart, FaOilCan, FaTint, 
  FaFan, FaCarSide, FaGasPump, FaTemperatureHigh,
  FaCheck, FaShieldAlt, FaClock, FaCogs
} from 'react-icons/fa';
import { motion, useInView } from 'framer-motion';
import Header from '../../sections/Header';
import Footer from '../../sections/Footer';
import ServicesSection from '../../sections/ServicesSection';

const ServicesPage = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const services = [

  ];

  const stats = [
    { value: "12,000+", label: "Clientes satisfechos", icon: <FaCheck /> },
    { value: "98%", label: "Tasa de satisfacción", icon: <FaShieldAlt /> },
    { value: "24/7", label: "Servicio de emergencia", icon: <FaClock /> },
    { value: "50+", label: "Técnicos certificados", icon: <FaCogs /> }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 18
      }
    }
  };

  const mainServiceVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <>
      <Header />
      <div className={styles.pageContainer}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Servicios Profesionales 
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Mantenimiento y reparación de calidad para tu vehículo con garantía certificada
            </motion.p>
           
          </div>
        </section>

       <ServicesSection/>
       
        <section className={styles.statsSection}>
          <div className={styles.statsContainer}>
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className={styles.statCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className={styles.statIcon}>{stat.icon}</div>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContainer}>
            <h2>¿Listo para darle mantenimiento a tu vehículo?</h2>
            <p>Agenda una cita hoy mismo y obtén un 10% de descuento en tu primer servicio</p>
            <div className={styles.ctaButtons}>
              <motion.button
                onClick={() => navigate('/appointment')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={styles.primaryButton}
              >
                Agendar Cita
              </motion.button>
            
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default ServicesPage;