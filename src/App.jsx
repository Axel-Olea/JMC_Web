import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './components/pages/HomePage';
import LoginPage from './components/pages/Login/LoginPage';
import AboutPage from './components/pages/AboutPage';
import Register from './components/pages/Register/Register';
import './App.css';
import ProfilePage from './components/pages/Profile/Profile';
import VehicleRegisterPage from './components/pages/Profile/VehicleRegister/VehicleRegister';
import AppointmentPage from './components/pages/Appointment/Appointment';
import MechanicDashboard from './components/pages/mechanicDashboard';
import AdminRoute from './routes/AdminRoute';
import EditVehicle from './components/pages/Profile/EditVehicle/EditVehicle';
import ServicesPage from './components/pages/ServicesPage/ServicesPage';
import ScrollToTop from './components/sections/ScrollToTop';
import ResetPassword from './components/pages/ResetPassword/ResetPassword';



function App() {
  const nombreUsuario = "Juan"; 

  return (
    <Router>
       <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/appointment" element={<AppointmentPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<ProfilePage nombre={nombreUsuario} />} />
          <Route path="/VehicleRegister" element={<VehicleRegisterPage />} />
          <Route path="/edit-vehicle" element={<EditVehicle />} />
        <Route path="/services" element={<ServicesPage />} />
        
        {/* Protegemos la ruta solo para admin */}
        <Route path="/mechanic-dashboard" element={<AdminRoute />}>
          <Route index element={<MechanicDashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
