import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// Async thunk para registrar usuario
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ first_name, last_name, rut, email, password}, { rejectWithValue }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      return { uid, first_name, last_name, rut, email, role: 'user' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk para iniciar sesión
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      // 🔽 Obtener datos adicionales desde Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          uid: user.uid,
          email: user.email,
          role: userData.role || 'user',
          ...userData, // si quieres nombre, rut, etc.
        };
      } else {
        return rejectWithValue("El usuario no tiene un documento en Firestore.");
      }

    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Registro
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
