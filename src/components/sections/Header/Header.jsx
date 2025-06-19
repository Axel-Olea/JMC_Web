import { useState, useEffect } from 'react';
import { FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth } from '../../../firebase/firebaseConfig'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import logo from '../../../assets/logo-jmc.png';
import styles from './Header.module.scss';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe(); 
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };


return (
  <motion.header
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    className={`${styles.header} ${isScrolled ? styles['header--scrolled'] : ''}`}
  >
    <div className={styles.logoContainer}>
      <img src={logo} alt="Logo Mecánico" className={styles.logo} />
    </div>

    <button
      className={styles.menuButton}
      onClick={() => setIsOpen(!isOpen)}
      aria-label="Menú"
    >
      {isOpen ? <FaTimes /> : <FaBars />}
    </button>

    <nav className={`${styles.nav} ${isOpen ? styles.navOpen : ''}`}>
      <Link to="/" className={styles.navLink} onClick={() => setIsOpen(false)}>Inicio</Link>
      <Link to="/about" className={styles.navLink} onClick={() => setIsOpen(false)}>Quiénes Somos</Link>
      <Link to="/services" className={styles.navLink} onClick={() => setIsOpen(false)}>Servicios</Link>
      <Link to="/appointment" className={styles.navLink} onClick={() => setIsOpen(false)}>Agendamiento</Link>
    </nav>

    <div className={styles.loginContainer}>
      {user ? (
        <div className={styles.userMenu}>
          {/* <div className={styles.userInfo}>
            <span className={styles.welcomeText}>Hola, {user.displayName || user.email.split('@')[0]}</span>
          </div> */}
          <div className={styles.userActions}>
            <button
              onClick={() => navigate('/profile')}
              className={styles.profileButton}
              aria-label="Ir al perfil"
            >
              <FaUser /> Mi Perfil
            </button>
            <button 
              onClick={handleLogout} 
              className={styles.logoutButton} 
              aria-label="Cerrar sesión"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      ) : (
        <Link to="/login" className={styles.loginButton}>
          <FaUser className={styles.loginIcon} />
          <span>Iniciar sesión</span>
        </Link>
      )}
    </div>
  </motion.header>
);
};

export default Header;
