import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../../../firebase/firebaseConfig';
import { motion } from 'framer-motion';
import { FaCar, FaSave, FaArrowLeft } from 'react-icons/fa';
import Header from '../../../sections/Header';
import styles from './EditVehicle.module.scss';

const EditVehicle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    patente: '',
    color: ''
  });

  // Obtener datos del vehículo de la navegación
  useEffect(() => {
    if (location.state) {
      setVehicle(location.state);
      setFormData({
        brand: location.state.brand || '',
        model: location.state.model || '',
        year: location.state.year || '',
        patente: location.state.patente || '',
        color: location.state.color || ''
      });
    } else {
      navigate('/profile'); // Redirigir si no hay datos
    }
  }, [location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const vehicleRef = doc(firestore, 'vehicles', vehicle.id);
      await updateDoc(vehicleRef, formData);
      alert('Vehículo actualizado correctamente');
      navigate('/profile');
    } catch (error) {
      console.error('Error al actualizar el vehículo:', error);
      alert('Error al actualizar el vehículo');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/profile');
  };

  if (!vehicle) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <Header />
      <motion.div 
        className={styles.editContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.header}>
          <button onClick={handleBack} className={styles.backButton}>
            <FaArrowLeft /> Volver
          </button>
          <h2 className={styles.title}>
            <FaCar /> Editar Vehículo
          </h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.editForm}>
          <div className={styles.formGroup}>
            <label htmlFor="brand">Marca</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="model">Modelo</label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="year">Año</label>
            <input
              type="text"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="patente">Patente</label>
            <input
              type="text"
              id="patente"
              name="patente"
              value={formData.patente}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="color">Color</label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
            />
          </div>

          <motion.button
            type="submit"
            className={styles.saveButton}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            <FaSave /> {loading ? 'Guardando...' : 'Guardar Cambios'}
          </motion.button>
        </form>
      </motion.div>
    </>
  );
};

export default EditVehicle;