// components/Banner/Banner.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import styles from './Banner.module.scss';
import bannerImage from '../../../assets/bannerjmc.png';

const Banner = () => {
   const navigate = useNavigate();

    return (
      <div className={styles.bannerContainer}>
        <div className={styles.parallaxImage}></div> {/* Imagen de fondo con efecto */}
        <div className={styles.bannerContent}>
          <motion.p
              className={styles.subtitle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              JMC Repair
          </motion.p>       
          <motion.h1

              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              TECNOLOGÍA AL SERVICIO DE TU AUTO
            </motion.h1>
            <motion.button
              onClick={() => navigate('/services')} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className={styles.button}
            >
              VER SERVICIOS
            </motion.button>
        </div>
      </div>
    );
  };
  

export default Banner;