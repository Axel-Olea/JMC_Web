import React from 'react';
import styles from './Card.module.scss';

const Card = ({ title, imageName }) => {
  // Ruta base para imágenes en public/
  const getImagePath = () => {
    try {
      return `/images/${imageName}.jpeg`; // Cambiado a .jpeg
    } catch {
      return '/default-service.jpg'; // Imagen de respaldo en public/
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img 
          src={getImagePath()} 
          alt={title}
          className={styles.image}
          onError={(e) => {
            e.target.src = '/default-service.jpg'; // Fallback
          }}
        />
        <div className={styles.overlay}></div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <button className={styles.button}>Más información</button>
      </div>
    </div>
  );
};

export default Card;