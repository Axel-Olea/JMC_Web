import { useEffect, useState } from 'react';
import { auth, firestore } from '../../../firebase/firebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCar, FaEdit, FaTrash, FaPlus, FaUser, FaEnvelope, FaIdCard, FaPhone } from 'react-icons/fa';
import Header from '../../sections/Header';
import styles from './Profile.module.scss';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Nuevo estado para datos adicionales
  const [vehicles, setVehicles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);

      try {
        // Obtener datos adicionales del usuario desde Firestore
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        }

        // Obtener vehículos del usuario
        const vehiclesRef = collection(firestore, 'vehicles');
        const q = query(vehiclesRef, where('uid', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);

        const userVehicles = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setVehicles(userVehicles);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleDelete = async (id) => {
    const confirm = window.confirm('¿Estás seguro que deseas eliminar este vehículo?');
    if (!confirm) return;

    try {
      await deleteDoc(doc(firestore, 'vehicles', id));
      setVehicles((prevVehicles) => prevVehicles.filter((v) => v.id !== id));
      alert('Vehículo eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando vehículo:', error);
      alert('Error al eliminar el vehículo');
    }
  };

  const handleEdit = (vehiculo) => {
    navigate('/edit-vehicle', { state: vehiculo });
  };

  const handleRegisterVehicle = () => {
    navigate('/VehicleRegister');
  };

  return (
    <>
      <Header />
      <motion.div 
        className={styles.profileContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.profileHeader}>
          <h2 className={styles.profileTitle}>Mi Perfil</h2>

              {userData?.role === 'admin' && (
              <motion.button
                className={styles.adminButton}
                onClick={() => navigate('/mechanic-dashboard')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ir a Panel de Control
              </motion.button>
            
        )}
          
          {/* Sección de información del usuario */}
          <div className={styles.userInfoContainer}>
            <div className={styles.userInfoCard}>
              <div className={styles.userInfoItem}>
                <FaUser className={styles.userInfoIcon} />
                <div>
                  <h4>Nombre</h4>
                  <p>{userData?.nombreCompleto || 'No especificado'}</p>
                </div>
              </div>
              
              <div className={styles.userInfoItem}>
                <FaEnvelope className={styles.userInfoIcon} />
                <div>
                  <h4>Correo Electrónico</h4>
                  <p>{user?.email}</p>
                </div>
              </div>

              <div className={styles.userInfoItem}>
                <FaPhone className={styles.userInfoIcon} />
                <div>
                  <h4>Teléfono</h4>
                  <p>{userData?.phone || 'No especificado'}</p>
                </div>
              </div>
              
              <div className={styles.userInfoItem}>
                <FaIdCard className={styles.userInfoIcon} />
                <div>
                  <h4>RUT</h4>
                  <p>{userData?.rut || 'No especificado'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.vehiclesSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <FaCar className={styles.sectionIcon} />
              Mis Vehículos Registrados
            </h3>
            <motion.button 
              onClick={handleRegisterVehicle}
              className={styles.registerButton}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus /> Registrar nuevo vehículo
            </motion.button>
          </div>

          {vehicles.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No has registrado vehículos todavía.</p>
            </div>
          ) : (
            <div className={styles.vehiclesGrid}>
              {vehicles.map((vehiculo) => (
                <motion.div 
                  key={vehiculo.id}
                  className={styles.vehicleCard}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={styles.vehicleInfo}>
                    <h4 className={styles.vehicleBrand}>{vehiculo.brand}</h4>
                    <p className={styles.vehicleModel}>{vehiculo.model} ({vehiculo.year})</p>
                    <p className={styles.vehiclePlate}>
                      <span>Patente:</span> {vehiculo.patente || 'Sin patente'}
                    </p>
                  </div>
                  <div className={styles.vehicleActions}>
                    <button 
                      onClick={() => handleEdit(vehiculo)}
                      className={styles.editButton}
                    >
                      <FaEdit /> Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(vehiculo.id)}
                      className={styles.deleteButton}
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Profile;