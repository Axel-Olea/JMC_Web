// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from '../Login/LoginPage.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/authSlice';
import { registrarUsuario } from '../../../firebase/authService'; // ✅ nuevo servicio

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+569'); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const validarRut = (rut) => /^[0-9]{7,8}-[0-9kK]{1}$/.test(rut);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Elimina todo lo que no sea dígito
    if (value.startsWith('569') && value.length <= 11) {
      setPhone(`+${value}`);
    } else if (value.startsWith('9') && value.length <= 8) {
      setPhone(`+569${value}`);
    } else if (value === '') {
      setPhone('+569');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Validación de teléfono
    if (phone.length !== 12) {
      setLocalError('El teléfono debe tener 12 caracteres (+569XXXXXXXX)');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden.');
      return;
    }

    if (!validarRut(rut)) {
      setLocalError('El RUT ingresado no es válido. Formato: 12345678-9');
      return;
    }

    try {
      // ✅ Registrar usuario en Firebase Auth + Firestore
      const nuevoUsuario = await registrarUsuario(
        email,
        password,
        fullName.trim(),
        rut.trim(),
        'cliente',
        phone
      );

      dispatch(registerUser(nuevoUsuario));
      alert('Usuario registrado correctamente');
      navigate('/', { state: { nombre: fullName } });

    } catch (err) {
      setLocalError(err.message);
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
          <h3>Crear Cuenta</h3>

          {(localError || error) && (
            <div className={styles.errorMessage}>{localError || error}</div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="nombre">Nombre Completo</label>
            <input
              type="text"
              id="nombre"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Tu nombre"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="rut">RUT</label>
            <input
              type="text"
              id="rut"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              required
              placeholder="Ej: 12345678-9"
            />
          </div>

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
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={handlePhoneChange}
              required
              placeholder="+569XXXXXXXX"
              pattern="\+569\d{8}"
              title="Formato: +569 seguido de 8 dígitos"
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
              placeholder="*******"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="*******"
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>

          <div className={styles.links}>
            <span>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></span>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
