import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../../redux/authSlice';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './LoginPage.module.scss';
import { unwrapResult } from '@reduxjs/toolkit';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebaseConfig';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fromAppointment = location.state?.fromAppointment;

  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resultAction = await dispatch(loginUser({ email, password }));
      const userData = unwrapResult(resultAction);
      console.log('Login correcto:', userData);

      // 🔽 Obtener rol desde Firestore
      const userDocRef = doc(firestore, 'users', userData.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userInfo = userSnap.data();
        const userRole = userInfo.role;

        if (userRole === 'admin') {
          navigate('/mechanic-dashboard');
        } else if (fromAppointment) {
          navigate('/appointment', { state: { fromLogin: true }, replace: true });
        } else {
          navigate('/');
        }
      } else {
        console.error('El documento del usuario no existe en Firestore.');
      }
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  return (
    <div className={styles.loginPage}>
      <motion.div
        className={styles.loginContainer}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className={styles.logoSection}/>
         
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <h3>Iniciar Sesión</h3>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="******"
            />
          </div>

          <div className={styles.rememberMe}>
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Recordar mi sesión</label>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>

          <div className={styles.links}>
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
            <span>
              ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
            </span>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
