import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './GalleryCarousel.module.scss';

const images = [
  '/images/img-01.jpeg',
  '/images/img-02.jpeg',
  '/images/img-03.jpeg',
  '/images/img-04.jpeg',
  '/images/img-05.jpeg',
  '/images/img-06.jpeg',
];

const GalleryCarousel = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({ opacity: 1, y: 0 });
    }
  }, [isInView, controls]);

  return (
    <section className={styles.gallerySection} ref={ref}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 40 }}
        animate={controls}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span className={styles.subtitle}>Galería</span>
        <h2>Trabajos <span>realizados</span></h2>
        <div className={styles.divider}></div>
        <p>Revisa algunos de nuestros trabajos más recientes realizados en el taller.</p>
      </motion.div>

      <motion.div
        className={styles.carouselWrapper}
        initial={{ opacity: 0, y: 40 }}
        animate={controls}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          loop
          autoplay={{ delay: 3000 }}
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className={styles.swiper}
        >
          {images.map((src, index) => (
            <SwiperSlide key={index} className={styles.slide}>
              <img src={src} alt={`Trabajo ${index + 1}`} className={styles.image} />
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </section>
  );
};

export default GalleryCarousel;
