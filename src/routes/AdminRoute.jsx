// src/routes/AdminRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';

const AdminRoute = () => {
  const { user } = useSelector((state) => state.auth);
  const [isAdmin, setIsAdmin] = useState(null); // null: cargando, false: denegar, true: permitir

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const userDoc = doc(firestore, 'users', user.uid);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists() && userSnap.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error verificando rol de admin:', err);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  if (isAdmin === null) return <div>Cargando...</div>;

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
