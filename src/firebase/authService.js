import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import {
  auth,
  firestore
} from "./firebaseConfig";
import {
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";
import { serverTimestamp } from 'firebase/firestore';

/**
 * Registra un nuevo usuario en Auth y Firestore
 * @param {string} email 
 * @param {string} password 
 * @param {string} nombreCompleto 
 * @param {string} rut 
 * @param {string} role 
 */
export const registrarUsuario = async (email, password, nombreCompleto, rut, role = "cliente", phone) => {
  // Crear usuario en Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Actualizar el perfil en Auth con el nombre
  await updateProfile(userCredential.user, {
    displayName: nombreCompleto
  });

  const uid = userCredential.user.uid;

  // Guardar datos adicionales en Firestore
  const userDoc = doc(firestore, "users", uid);
  await setDoc(userDoc, {
    nombreCompleto,
    rut,
    email,
    phone,
    role,
    createdAt: serverTimestamp(),
    lastUpdated: serverTimestamp()
  });

  return {
    uid,
    email,
    displayName: nombreCompleto,
    role,
    nombreCompleto,
    rut,
    phone
  };
};

/**
 * Iniciar sesión y recuperar datos del usuario desde Firestore
 */
export const iniciarSesion = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Obtener datos desde Firestore
  const docRef = doc(firestore, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("No existe el documento del usuario en Firestore.");
  }

  const userData = docSnap.data();

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || userData.nombreCompleto,
    role: userData.role || "cliente",
    nombreCompleto: userData.nombreCompleto,
    rut: userData.rut
  };
};