// src/components/auth/RequireAdmin.jsx
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebase/firebaseConfig';
import { Navigate } from 'react-router-dom';

const RequireAdmin = ({ children }) => {
  const [authorized, setAuthorized] = useState(null); // null = loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthorized(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        const role = userDoc.exists() ? userDoc.data().role : null;

        setAuthorized(role === 'admin');
      } catch (error) {
        console.error('Error verificando rol de usuario:', error);
        setAuthorized(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (authorized === null) return <p>Cargando...</p>;
  if (!authorized) return <Navigate to="/mechanic-dashboard" replace />;

  return children;
};

export default RequireAdmin;
