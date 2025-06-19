import { useState, useEffect } from 'react';
import { auth, firestore } from '../../../../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaSave, FaArrowLeft, FaCarAlt, FaCalendarAlt, FaIdCardAlt } from 'react-icons/fa';
import styles from './VehicleRegister.module.scss';

const marcas = {
  Toyota: ['Corolla', 'Camry', 'Hilux', 'Yaris', 'Land Cruiser'],
  Ford: ['Fiesta', 'Focus', 'Mustang', 'Explorer', 'F-150'],
  Honda: ['Civic', 'Accord', 'CR-V', 'Fit', 'Pilot'],
  Chevrolet: ['Spark', 'Malibu', 'Equinox', 'Tahoe', 'Silverado'],
  BMW: ['Serie 3', 'Serie 5', 'X3', 'X5', 'i3'],
  Mercedes: ['Clase A', 'Clase C', 'Clase E', 'GLE', 'GLC'],
  Nissan: ['Sentra', 'Altima', 'Leaf', 'Rogue', 'Frontier'],
  Volkswagen: ['Golf', 'Passat', 'Polo', 'Tiguan', 'Jetta'],
  Audi: ['A3', 'A4', 'A6', 'Q5', 'Q7'],
  Kia: ['Rio', 'Soul', 'Sportage', 'Sorento', 'Optima'],
  Hyundai: ['Elantra', 'Santa Fe', 'Tucson', 'Accent', 'Sonata'],
  Mazda: ['Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-9'],
  Subaru: ['Impreza', 'Forester', 'Outback', 'Crosstrek', 'Legacy'],
  Jeep: ['Wrangler', 'Cherokee', 'Grand Cherokee', 'Renegade', 'Compass'],
  Tesla: ['Model S', 'Model 3', 'Model X', 'Model Y'],
};

const años = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

const VehicleRegister = () => {
  const [formData, setFormData] = useState({
    patente: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    vin: '',
    notes: ''
  });

const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else navigate('/login');
    });
    return () => unsub();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'patente' ? value.toUpperCase() : value
    }));

    // Reset model if brand changes
    if (name === 'brand') {
      setFormData(prev => ({ ...prev, model: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('Usuario no autenticado');
      
      const vehicleData = {
        ...formData,
        uid: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Usuario',
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      await addDoc(collection(firestore, 'vehicles'), vehicleData);
      alert('Vehículo registrado correctamente');
      navigate('/profile');
    } catch (error) {
      console.error('Error registrando vehículo:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.brand && formData.model && formData.year && formData.patente;

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate('/profile')}>
            <FaArrowLeft /> Volver
          </button>
          <div className={styles.titleContainer}>
            <FaCar className={styles.titleIcon} />
            <h2>Registrar Vehículo</h2>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.vehicleForm}>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <FaIdCardAlt className={styles.inputIcon} />
                <span>Patente *</span>
              </label>
              <input
                type="text"
                name="patente"
                value={formData.patente}
                onChange={handleChange}
                placeholder="Ej: ABC123 o AB123CD"
                maxLength={10}
                required
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <FaCarAlt className={styles.inputIcon} />
                <span>Marca *</span>
              </label>
              <select 
                name="brand"
                value={formData.brand} 
                onChange={handleChange}
                className={styles.formSelect}
                required
              >
                <option value="">Seleccione una marca</option>
                {Object.keys(marcas).map((marca) => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <FaCarAlt className={styles.inputIcon} />
                <span>Modelo *</span>
              </label>
              <select
                name="model"
                value={formData.model}
                onChange={handleChange}
                disabled={!formData.brand}
                className={styles.formSelect}
                required
              >
                <option value="">Seleccione un modelo</option>
                {marcas[formData.brand]?.map((modelo) => (
                  <option key={modelo} value={modelo}>{modelo}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <FaCalendarAlt className={styles.inputIcon} />
                <span>Año *</span>
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={styles.formSelect}
                required
              >
                <option value="">Seleccione un año</option>
                {años.map((año) => (
                  <option key={año} value={año}>{año}</option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <FaCarAlt className={styles.inputIcon} />
                <span>Color</span>
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Ej: Rojo"
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <FaIdCardAlt className={styles.inputIcon} />
                <span>Número de Chasis (VIN)</span>
              </label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                placeholder="Número de identificación del vehículo"
                className={styles.formInput}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                <FaCarAlt className={styles.inputIcon} />
                <span>Notas Adicionales</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Problemas conocidos, modificaciones especiales, etc."
                rows="3"
                className={styles.formTextarea}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button 
              type="submit" 
              disabled={!isFormValid || loading}
              className={styles.submitButton}
            >
              <FaSave /> {loading ? 'Registrando...' : 'Registrar Vehículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRegister;