import React, { useRef } from 'react';
import styles from './ServicesSection.module.scss';
import { FaTools, FaCarCrash, FaCarAlt, FaCarBattery, FaWrench, FaShoppingCart } from 'react-icons/fa';
import { motion, useInView } from 'framer-motion';

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const services = [
    { 
      title: "Mantenimiento y reparación general", 
      imagePath: "/images/img-01.jpeg",
      icon: <FaTools />,
      features: [
        "Cambio de aceite y filtros",
        "Revisión completa del vehículo",
        "Ajuste de componentes mecánicos"
      ]
    },
    { 
      title: "Sistema de frenos", 
      imagePath: "/images/img-02.jpeg",
      icon: <FaCarCrash />,
      features: [
        "Cambio de pastillas y discos",
        "Rectificado de discos",
        "Bleeding del sistema"
      ]
    },
    { 
      title: "Sistema de suspensión y dirección", 
      imagePath: "/images/img-03.jpeg",
      icon: <FaCarAlt />,
      features: [
        "Alineación computarizada",
        "Balanceo de ruedas",
        "Cambio de amortiguadores"
      ]
    },
    { 
      title: "Sistema eléctrico", 
      imagePath: "/images/img-04.jpeg",
      icon: <FaCarBattery />,
      features: [
        "Diagnóstico computarizado",
        "Reparación de alternador",
        "Sistema de carga y arranque"
      ]
    },
    { 
      title: "Revisión técnica preventiva", 
      imagePath: "/images/img-05.jpeg",
      icon: <FaWrench />,
      features: [
        "Inspección completa",
        "Certificado de revisión",
        "Checklist de 50 puntos"
      ]
    },
    { 
      title: "Venta de repuestos y accesorios", 
      imagePath: "/images/img-06.jpeg",
      icon: <FaShoppingCart />,
      features: [
        "Repuestos originales",
        "Accesorios premium",
        "Asesoría especializada"
      ]
    }
  ];

  // Variantes de animación
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
    <section className={styles.section} ref={ref}>
      <motion.div 
        className={styles.sectionHeader}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 1.2, ease: "easeInOut" }
          }
        }}
      >
        <motion.span 
          className={styles.sectionSubtitle}
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          Lo que ofrecemos
        </motion.span>
        <motion.h2 
          className={styles.sectionTitle}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
        >
          Nuestros <span>Servicios</span>
        </motion.h2>
        <motion.div 
          className={styles.headerDivider}
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.4 }}
        />
      </motion.div>

      <motion.div 
        className={styles.servicesGrid}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Servicios principales (destacados) */}
        <motion.div 
          className={styles.mainService} 
          style={{backgroundImage: `url(${services[0].imagePath})`}}
          variants={mainServiceVariants}
          whileHover={{ 
            y: -10,
            boxShadow: "0 25px 50px rgba(163, 4, 4, 0.3)"
          }}
        >
          <motion.div 
            className={styles.serviceOverlay}
            whileHover={{ background: "rgba(0, 0, 0, 0.7)" }}
          >
            <motion.div 
              className={styles.serviceIcon}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.5 }}
            >
              {services[0].icon}
            </motion.div>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
            >
              {services[0].title}
            </motion.h3>
            <motion.ul
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.7 }}
            >
              {services[0].features.map((feature, index) => (
                <motion.li 
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={isInView ? { x: 0, opacity: 1 } : {}}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  {feature}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </motion.div>

        <motion.div 
          className={styles.mainService} 
          style={{backgroundImage: `url(${services[1].imagePath})`}}
          variants={mainServiceVariants}
          whileHover={{ 
            y: -10,
            boxShadow: "0 25px 50px rgba(163, 4, 4, 0.3)"
          }}
        >
          <motion.div 
            className={styles.serviceOverlay}
            whileHover={{ background: "rgba(0, 0, 0, 0.7)" }}
          >
            <motion.div 
              className={styles.serviceIcon}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.5 }}
            >
              {services[1].icon}
            </motion.div>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
            >
              {services[1].title}
            </motion.h3>
            <motion.ul
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.7 }}
            >
              {services[1].features.map((feature, index) => (
                <motion.li 
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={isInView ? { x: 0, opacity: 1 } : {}}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  {feature}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </motion.div>

        {/* Servicios secundarios */}
        <motion.div 
          className={styles.secondaryServices}
          variants={containerVariants}
        >
          {services.slice(2).map((service, index) => (
            <motion.div 
              key={index} 
              className={styles.secondaryService}
              variants={itemVariants}
              whileHover={{ 
                  y: -8,
                  boxShadow: "0 25px 50px rgba(163, 4, 4, 0.25)",
                  transition: { duration: 0.4, ease: "easeOut" }
              }}
            >
              <motion.div 
                className={styles.serviceIcon}
                whileHover={{ rotate: 15, scale: 1.1 }}
              >
                {service.icon}
              </motion.div>
              <motion.h3
                whileHover={{ color: "#A30404" }}
              >
                {service.title}
              </motion.h3>
              <ul>
                {service.features.map((feature, i) => (
                  <motion.li 
                    key={i}
                    whileHover={{ x: 5, color: "#A30404" }}
                  >
                    {feature}
                  </motion.li>
                ))}
              </ul>
              <motion.div 
                className={styles.serviceImage} 
                style={{backgroundImage: `url(${service.imagePath})`}}
                whileHover={{ scale: 1.1 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ServicesSection;