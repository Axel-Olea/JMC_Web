import React from 'react';
import styles from './PromoRibbon.module.scss';

const offers = [
  "🔥 20% OFF en Cambio de Aceite + Filtro (Solo este mes)",
  "🚗💨 Revisión Gratis de Frenos con cualquier Servicio",
  "🛠️ Pack Mantenimiento Básico: $99.000 (Incluye 5 puntos de control)"
];

const PromoRibbon = () => {
  return (
    <div className={styles.ribbonWrapper}>
      <div className={styles.ribbon}>
        <div className={styles.offersTrack}>
          {[...offers, ...offers].map((offer, index) => ( // Duplicamos para efecto continuo
            <div key={index} className={styles.offer}>
              {offer} &nbsp; • &nbsp; {/* Separador */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoRibbon;