import React, { useState, useEffect, useRef } from 'react';
import styles from './ContactSection.module.scss';
import { useAnimation, useInView } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaPaperPlane, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const controls = useAnimation();
  const ref = useRef(null);
  const formRef = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
    // Inicializa EmailJS (reemplaza con tus credenciales)
    emailjs.init('tu-user-id-de-emailjs');
  }, [controls, isInView]);

  const address = "San José 495, Maipú, Chile";
  const encodedAddress = encodeURIComponent(address);
  const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&output=embed&z=16`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Envía el formulario usando EmailJS
      const result = await emailjs.sendForm(
        'service_9d9c72r', 
        'template_kpx9dsq', 
        formRef.current,
        'FHIMDWjmQmJICd1YF' 
      );

      if (result.status === 200) {
        setSubmitStatus({ 
          success: true, 
          message: '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.' 
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        throw new Error('No se pudo enviar el mensaje');
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      setSubmitStatus({ 
        success: false, 
        message: 'Ocurrió un error al enviar el mensaje. Por favor intenta nuevamente.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.contactSection} id="contacto" ref={ref}>
      <motion.div
        className={styles.sectionHeader}
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
          }
        }}
      >
        <h2>Contacto y Ubicación</h2>
        <p>Visítanos o escríbenos para más información</p>
      </motion.div>

      <div className={styles.contactContainer}>
        {/* Mapa - Lado izquierdo */}
        <motion.div 
          className={styles.mapContainer}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, x: -50 },
            visible: { 
              opacity: 1, 
              x: 0,
              transition: { duration: 0.8, delay: 0.2, ease: "easeOut" }
            }
          }}
        >
          <div className={styles.mapWrapper}>
            <iframe
              title="Ubicación del taller"
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <motion.div 
            className={styles.addressOverlay}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <h3><FaMapMarkerAlt className={styles.icon} /> Taller JMC Repair </h3>
            <address>
              <p>{address}</p>
              <p><FaPhone className={styles.icon} /> +56 9 6662 1072</p>
            </address>
          </motion.div>
        </motion.div>

        {/* Formulario - Lado derecho */}
        <motion.div 
          className={styles.formContainer}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, x: 50 },
            visible: { 
              opacity: 1, 
              x: 0,
              transition: { duration: 0.8, delay: 0.4, ease: "easeOut" }
            }
          }}
        >
          <h3>Envíanos un mensaje</h3>
          
          {submitStatus && (
            <motion.div 
              className={`${styles.alert} ${submitStatus.success ? styles.success : styles.error}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {submitStatus.success ? <FaCheck /> : <FaExclamationTriangle />}
              <span>{submitStatus.message}</span>
            </motion.div>
          )}
          
          <form ref={formRef} onSubmit={handleSubmit} className={styles.contactForm}>
            <motion.div 
              className={styles.formGroup}
              whileFocus={{ scale: 1.02 }}
            >
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Tu nombre completo"
                disabled={isSubmitting}
              />
            </motion.div>
            
            <motion.div 
              className={styles.formGroup}
              whileFocus={{ scale: 1.02 }}
            >
              <label htmlFor="email">Correo Electrónico *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
                disabled={isSubmitting}
              />
            </motion.div>
            
            <motion.div 
              className={styles.formGroup}
              whileFocus={{ scale: 1.02 }}
            >
              <label htmlFor="phone">Teléfono</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
                disabled={isSubmitting}
              />
            </motion.div>
            
            <motion.div 
              className={styles.formGroup}
              whileFocus={{ scale: 1.02 }}
            >
              <label htmlFor="message">Mensaje *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Cuéntanos sobre tu vehículo y lo que necesita..."
                disabled={isSubmitting}
              ></textarea>
            </motion.div>
            
            <motion.button 
              type="submit" 
              className={styles.submitButton}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 8px 20px rgba(163, 4, 4, 0.3)"
              }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              <FaPaperPlane className={styles.buttonIcon} /> 
              {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;