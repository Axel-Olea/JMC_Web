import { useState } from 'react';
import { sendPasswordReset } from '../../../firebase/authService';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from './ResetPassword.module.scss';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await sendPasswordReset(email);
    setMessage({
      text: result.message,
      isError: !result.success
    });
    setIsLoading(false);
  };

  return (
    <div className={styles.container}>
      <Link to="/login" className={styles.backButton}>
        <FaArrowLeft /> Volver
      </Link>
      
      <div className={styles.card}>
        <h2>Restablecer contraseña</h2>
        <p>Ingresa tu correo electrónico para recibir el enlace de restablecimiento</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <FaEnvelope className={styles.icon} />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>
        
        {message.text && (
          <p className={message.isError ? styles.errorMessage : styles.successMessage}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;