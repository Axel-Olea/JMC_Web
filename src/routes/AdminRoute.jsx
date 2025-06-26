// src/routes/AdminRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';

const AdminRoute = () => {
  const { user } = useSelector((state) => state.auth);
  const [access, setAccess] = useState('checking'); // checking, granted, denied

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (!user?.uid) {
          setAccess('denied');
          return;
        }

        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setAccess('granted');
        } else {
          setAccess('denied');
        }
      } catch (error) {
        console.error('Error verifying admin access:', error);
        setAccess('denied');
      }
    };

    checkAccess();
  }, [user]);

  // Mostrar spinner mientras se verifica
  if (access === 'checking') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Redirigir si no tiene acceso
  if (access === 'denied') {
    console.warn('Intento de acceso no autorizado al panel admin');
    return <Navigate to="/" replace />;
  }

  // Permitir acceso
  return <Outlet />;
};

export default AdminRoute;
