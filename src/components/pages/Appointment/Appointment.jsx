import { useState, useEffect } from 'react';
import { auth, firestore } from '../../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, onSnapshot } from 'firebase/firestore';
import { 
  FaCalendarAlt, FaClock, FaCar, FaTools, 
  FaUser, FaEnvelope, FaPhone, FaSignInAlt, 
  FaUserPlus, FaArrowLeft, FaCheckCircle, FaPlus
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Appointment.module.scss';
import Header from '../../sections/Header';
import emailjs from '@emailjs/browser';

const services = [
  'Cambio de aceite',
  'Revisión de frenos',
  'Rotación de neumáticos',
  'Diagnóstico de motor',
  'Reemplazo de batería',
  'Alineación y balanceo',
  'Servicio de transmisión'
];

const generateTimeSlots = (isSaturday) => {
  const startHour = isSaturday ? 9 : 9;
  const endHour = isSaturday ? 14 : 18;
  const slots = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  
  return slots;
};

const generateCalendarDays = () => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar la hora
  
  // Comenzar desde el lunes más cercano
  while (today.getDay() !== 1) { // 1 = Lunes
    today.setDate(today.getDate() - 1);
  }
  
  // Generar 4 semanas completas (Lunes a Sábado)
  for (let week = 0; week < 4; week++) {
    for (let day = 0; day < 6; day++) { // 6 días (Lunes a Sábado)
      days.push(new Date(today));
      today.setDate(today.getDate() + 1);
    }
  }
  
  return days;
};

const AppointmentPage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState({
    user: null,
    vehicles: [],
    loading: false, // Cambiado a false para permitir acceso inmediato
    loadingTimeSlots: false,
    error: null,
    showConfirmation: false,
    appointmentConfirmed: null,
    formData: {
      fullName: '',
      email: '',
      phone: '',
      vehicleBrand: '',
      vehicleModel: '',
      vehicleYear: '',
      vehiclePlate: '',
      date: '',
      time: '',
      service: '',
      notes: ''
    },
    message: { text: '', type: '' },
    calendarDays: generateCalendarDays(),
    bookedAppointments: [],
    selectedDate: null,
    timeSlots: []
  });

  useEffect(() => {
    let unsubscribeFromAppointments = null;
    let unsubscribeFromAuth = null;
    emailjs.init("FHIMDWjmQmJICd1YF");
    
    const fetchData = async () => {
      try {
        // Carga inicial de citas
        const initialAppointments = await loadAppointments();

        // Configura suscripción en tiempo real para actualizaciones
        const q = query(collection(firestore, 'appointments'));
        unsubscribeFromAppointments = onSnapshot(q, (snapshot) => {
          const updatedAppointments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.split('T')[0] // Normalizar formato de fecha
          }));
          
          setState(prev => ({
            ...prev,
            bookedAppointments: updatedAppointments
          }));
          
          // Si hay una fecha seleccionada, actualizar sus horarios
          if (state.selectedDate) {
            handleDateSelect(state.selectedDate);
          }
        });

        unsubscribeFromAuth = onAuthStateChanged(auth, async (user) => {
          if (user) {
            const vehicles = await loadUserVehicles(user.uid);

            setState(prev => ({
              ...prev,
              user,
              vehicles,
              bookedAppointments: initialAppointments,
              loading: false,
              formData: {
                ...prev.formData,
                fullName: user.displayName || '',
                email: user.email || '',
                ...(vehicles[0] ? {
                  vehicleBrand: vehicles[0].brand,
                  vehicleModel: vehicles[0].model,
                  vehicleYear: vehicles[0].year,
                  vehiclePlate: vehicles[0].patente
                } : {})
              }
            }));
          } else {
            // Modo invitado - no redirigir
            setState(prev => ({
              ...prev,
              user: null,
              loading: false,
              bookedAppointments: initialAppointments
            }));
          }
        });

      } catch (error) {
        console.error("Error al cargar datos:", error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: "Error al cargar datos del sistema"
        }));
      }
    };

    fetchData();

    // Función de limpieza
    return () => {
      if (unsubscribeFromAppointments) unsubscribeFromAppointments();
      if (unsubscribeFromAuth) unsubscribeFromAuth();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, state.selectedDate]);

  // handleDateSelect modificado
  const handleDateSelect = async (date) => {
    setState(prev => ({
      ...prev,
      loadingTimeSlots: true,
      selectedDate: date,
      formData: {
        ...prev.formData,
        time: '' // Limpiamos la selección de hora
      },
      timeSlots: []
    }));

    try {
      const dateStr = formatDateLocal(date);
      const isSaturday = date.getDay() === 6;
      const timeSlots = generateTimeSlots(isSaturday);
      
      // Verificación en tiempo real con Firestore
      const q = query(
        collection(firestore, 'appointments'),
        where('date', '==', dateStr)
      );
      const snapshot = await getDocs(q);
      const bookedTimes = snapshot.docs.map(doc => doc.data().time);

      setState(prev => ({
        ...prev,
        loadingTimeSlots: false,
        formData: {
          ...prev.formData,
          date: dateStr
        },
        timeSlots: timeSlots.map(time => ({
          time,
          available: !bookedTimes.includes(time),
          userId: snapshot.docs.find(doc => doc.data().time === time)?.data()?.userId || null
        }))
      }));
    } catch (error) {
      console.error("Error al cargar horarios:", error);
      setState(prev => ({
        ...prev,
        loadingTimeSlots: false,
        message: {
          text: 'Error al cargar los horarios disponibles',
          type: 'error'
        }
      }));
    }
  };

  // Función auxiliar para formatear fechas en formato YYYY-MM-DD
  const formatDateLocal = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  };

  const handleTimeSelect = (time) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        time
      }
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value
      }
    }));
  };

  const handleVehicleChange = (e) => {
    const vehicle = state.vehicles.find(v => v.id === e.target.value);
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        vehicleBrand: vehicle?.brand || '',
        vehicleModel: vehicle?.model || '',
        vehicleYear: vehicle?.year || '',
        vehiclePlate: vehicle?.patente || ''
      }
    }));
  };

  // Función para cargar citas desde Firestore (ahora se usa consistentemente)
  const loadAppointments = async () => {
    try {
      const q = query(collection(firestore, 'appointments'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.split('T')[0] // Aseguramos formato consistente
      }));
    } catch (error) {
      console.error("Error cargando citas:", error);
      return [];
    }
  };

  const loadUserVehicles = async (userId) => {
    try {
      const q = query(
        collection(firestore, 'vehicles'),
        where('uid', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error cargando vehículos:", error);
      return [];
    }
  };

  // handleSubmit optimizado
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación de campos requeridos
    const requiredFields = state.user 
      ? ['date', 'time', 'service', 'vehiclePlate']
      : ['fullName', 'email', 'phone', 'date', 'time', 'service', 'vehiclePlate'];
    
    const missingFields = requiredFields.filter(field => !state.formData[field]);
    
    if (missingFields.length > 0) {
      setState(prev => ({
        ...prev,
        message: { 
          text: `Por favor completa los campos requeridos: ${missingFields.join(', ')}`, 
          type: 'error' 
        }
      }));
      return;
    }

    const selectedDateStr = state.formData.date;
    const selectedTime = state.formData.time;

    // 1. Verificación en slots mostrados
    const selectedSlot = state.timeSlots.find(slot => slot.time === selectedTime);
    if (!selectedSlot || !selectedSlot.available) {
      setState(prev => ({
        ...prev,
        message: { 
          text: 'Horario no disponible. Por favor selecciona otro.', 
          type: 'error' 
        }
      }));
      return;
    }

    try {
      // 2. Verificación final contra Firestore
      const appointmentsQuery = query(
        collection(firestore, 'appointments'),
        where('date', '==', selectedDateStr),
        where('time', '==', selectedTime)
      );
      const snapshot = await getDocs(appointmentsQuery);
      
      if (!snapshot.empty) {
        setState(prev => ({
          ...prev,
          message: { 
            text: 'Este horario fue reservado recientemente.', 
            type: 'error' 
          }
        }));
        
        // Recargar citas y disponibilidad
        const updatedAppointments = await loadAppointments();
        setState(prev => ({
          ...prev,
          bookedAppointments: updatedAppointments
        }));
        
        if (state.selectedDate) {
          await handleDateSelect(state.selectedDate);
        }
        return;
      }

      // Crear la cita
      const appointmentData = {
        ...state.formData,
        userId: state.user?.uid || 'guest',
        status: 'Pendiente',
        createdAt: new Date().toISOString(),
        client: state.user ? state.user.displayName || state.user.email.split('@')[0] : state.formData.fullName,
        vehicle: `${state.formData.vehicleBrand} ${state.formData.vehicleModel} (${state.formData.vehiclePlate})`,
        service: state.formData.service,
        date: selectedDateStr,
        time: selectedTime,
        notes: state.formData.notes || 'Sin notas adicionales'
      };

      const docRef = await addDoc(collection(firestore, 'appointments'), appointmentData);
      
      // Actualizar estado con la nueva cita
      const updatedAppointments = await loadAppointments();

      try {
        const emailData = {
          ...appointmentData,
          id: docRef.id,
          // Asegura que ningún campo sea undefined
          fullName: appointmentData.fullName || appointmentData.client || 'Cliente',
          email: appointmentData.email,
          vehicleBrand: appointmentData.vehicleBrand || '',
          vehicleModel: appointmentData.vehicleModel || '',
          vehiclePlate: appointmentData.vehiclePlate || 'Sin patente'
        };

        const emailSent = await sendConfirmationEmail(emailData);

        if (!emailSent) {
          console.warn('El correo no pudo enviarse, pero la cita fue agendada');
          // Opcional: mostrar notificación al usuario
          setState(prev => ({
            ...prev,
            message: {
              text: 'Cita agendada, pero no pudimos enviar el correo de confirmación',
              type: 'warning'
            }
          }));
        }
      } catch (emailError) {
        console.error('Error en el proceso de envío de email:', emailError);
      }
      
      setState(prev => ({
        ...prev,
        bookedAppointments: updatedAppointments,
        showConfirmation: true,
        appointmentConfirmed: {
          ...appointmentData,
          id: docRef.id
        },
        message: { text: '', type: '' },
        formData: {
          ...prev.formData,
          time: '',
          service: '',
          notes: ''
        }
      }));

      // Actualizar disponibilidad
      if (state.selectedDate) {
        await handleDateSelect(state.selectedDate);
      }

    } catch (error) {
      console.error('Error al agendar:', error);
      
      // Manejo de errores específicos
      let errorMessage = 'Error al agendar. Intenta nuevamente.';
      if (error.code === 'permission-denied') {
        errorMessage = 'No tienes permiso para realizar esta acción.';
      }
      
      setState(prev => ({
        ...prev,
        message: { 
          text: errorMessage, 
          type: 'error' 
        }
      }));
      
      // Recargar datos si hay error
      const updatedAppointments = await loadAppointments();
      setState(prev => ({
        ...prev,
        bookedAppointments: updatedAppointments
      }));
      
      if (state.selectedDate) {
        await handleDateSelect(state.selectedDate);
      }
    }
  };

  const EMAILJS_SERVICE_ID = 'service_9d9c72r';
  const EMAILJS_TEMPLATE_ID = 'template_7nr3wgi';
  const EMAILJS_PUBLIC_KEY = 'FHIMDWjmQmJICd1YF';

  // 3. Crea una función para enviar el correo
  const sendConfirmationEmail = async (appointmentData) => {
    try {
      // Validación completa de datos
      const email = appointmentData.email?.trim();
      if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        throw new Error('Email no válido');
      }

      const templateParams = {
        to_name: (appointmentData.fullName || appointmentData.client || 'Cliente').substring(0, 100),
        to_email: email,
        date: (appointmentData.date ? new Date(appointmentData.date + 'T12:00:00').toLocaleDateString('es-CL', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        }) : 'Fecha no especificada').substring(0, 50),
        time: (appointmentData.time || 'Hora no especificada').substring(0, 20),
        service: (appointmentData.service || 'Servicio no especificado').substring(0, 100),
        vehicle: `${appointmentData.vehicleBrand || ''} ${appointmentData.vehicleModel || ''} (${appointmentData.vehiclePlate || 'Sin patente'})`.trim().substring(0, 150),
        notes: (appointmentData.notes || 'Sin notas adicionales').substring(0, 500)
      };

      // Método alternativo usando fetch directamente
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'service_9d9c72r',
          template_id: 'template_7nr3wgi',
          user_id: 'FHIMDWjmQmJICd1YF',
          template_params: templateParams,
          accessToken: 'FHIMDWjmQmJICd1YF' // Usa la misma public key como accessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar el correo');
      }

      return true;
    } catch (error) {
      console.error('Error avanzado al enviar email:', {
        message: error.message,
        stack: error.stack,
        data: appointmentData
      });
      return false;
    }
  };

  const ConfirmationView = ({ appointment, user, onBack }) => (
    <div className={styles.confirmationView}>
      <div className={styles.confirmationHeader}>
        <FaCheckCircle className={styles.confirmationIcon} />
        <h2 className={styles.confirmationTitle}>¡Tu cita ha sido agendada!</h2>
        <p className={styles.confirmationSubtitle}>Te hemos enviado un correo de confirmación</p>
      </div>
      
      <div className={styles.confirmationCard}>
        <h3 className={styles.summaryTitle}>
          <FaCalendarAlt /> Resumen de tu cita
        </h3>
        
        <div className={styles.summarySection}>
          <h4 className={styles.summarySectionTitle}>Datos del Cliente</h4>
          <div className={styles.summaryItem}>
            <FaUser className={styles.summaryIcon} />
            <div>
              <p className={styles.summaryLabel}>Nombre</p>
              <p className={styles.summaryValue}>
                {appointment.fullName || user?.displayName || user?.email || '—'}
              </p>
            </div>
          </div>

          <div className={styles.summaryItem}>
            <FaEnvelope className={styles.summaryIcon} />
            <div>
              <p className={styles.summaryLabel}>Correo</p>
              <p className={styles.summaryValue}>
                {appointment.email || user?.email || '—'}
              </p>
            </div>
          </div>

          {(!user || appointment.phone) && (
            <div className={styles.summaryItem}>
              <FaPhone className={styles.summaryIcon} />
              <div>
                <p className={styles.summaryLabel}>Teléfono</p>
                <p className={styles.summaryValue}>
                  {appointment.phone || '—'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.summarySection}>
          <h4 className={styles.summarySectionTitle}>Vehículo</h4>
          <div className={styles.summaryItem}>
            <FaCar className={styles.summaryIcon} />
            <div>
              <p className={styles.summaryLabel}>Patente</p>
              <p className={styles.summaryValue}>
                {appointment.vehiclePlate || '—'}
              </p>
            </div>
          </div>

          {(appointment.vehicleBrand || appointment.vehicleModel) && (
            <div className={styles.summaryItem}>
              <div>
                <p className={styles.summaryLabel}>Marca/Modelo</p>
                <p className={styles.summaryValue}>
                  {`${appointment.vehicleBrand || ''} ${appointment.vehicleModel || ''}`.trim() || '—'}
                </p>
              </div>
            </div>
          )}

          {appointment.vehicleYear && (
            <div className={styles.summaryItem}>
              <div>
                <p className={styles.summaryLabel}>Año</p>
                <p className={styles.summaryValue}>
                  {appointment.vehicleYear || '—'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.summarySection}>
          <h4 className={styles.summarySectionTitle}>Detalles de Cita</h4>
          <div className={styles.summaryItem}>
            <FaCalendarAlt className={styles.summaryIcon} />
            <div>
              <p className={styles.summaryLabel}>Fecha</p>
              <p className={styles.summaryValue}>
                {new Date(appointment.date + 'T12:00:00').toLocaleDateString('es-CL', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
          </div>

          <div className={styles.summaryItem}>
            <FaClock className={styles.summaryIcon} />
            <div>
              <p className={styles.summaryLabel}>Hora</p>
              <p className={styles.summaryValue}>
                {appointment.time || '—'}
              </p>
            </div>
          </div>

          <div className={styles.summaryItem}>
            <FaTools className={styles.summaryIcon} />
            <div>
              <p className={styles.summaryLabel}>Servicio</p>
              <p className={styles.summaryValue}>
                {appointment.service || '—'}
              </p>
            </div>
          </div>

          {appointment.notes && (
            <div className={styles.summaryItem}>
              <div>
                <p className={styles.summaryLabel}>Notas adicionales</p>
                <p className={styles.summaryValue}>
                  {appointment.notes || '—'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.confirmationActions}>
          <button 
            onClick={onBack}
            className={styles.backButton}
          >
            <FaArrowLeft /> Agendar otra cita
          </button>
          <Link to="/" className={styles.homeButton}>
            Ir a la página principal
          </Link>
        </div>
      </div>
    </div>
  );

  if (state.loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando disponibilidad...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{state.error}</p>
        <button 
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (state.showConfirmation) {
    return (
      <ConfirmationView 
        appointment={state.appointmentConfirmed}
        user={state.user}
        onBack={() => setState(prev => ({ 
          ...prev, 
          showConfirmation: false,
          formData: {
            ...prev.formData,
            date: '',
            time: '',
            service: '',
            notes: ''
          },
          selectedDate: null,
          timeSlots: []
        }))}
      />
    );
  }

  return (
    <>
      <Header/>
      <div className={styles.appointmentContainer}>
        <div className={styles.appointmentCard}>
          <h2 className={styles.title}>
            {state.user ? 'Agendar Cita' : 'Agendar como Invitado'}
            {state.user && <span className={styles.userBadge}>Sesión iniciada</span>}
          </h2>
          
          {state.message.text && (
            <div className={`${styles.message} ${styles[state.message.type]}`}>
              {state.message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.appointmentForm}>
            {!state.user && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>
                    <FaUser className={styles.inputIcon} />
                    <span>Nombre completo *</span>
                  </label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={state.formData.fullName} 
                    onChange={handleChange}
                    className={styles.inputField}
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>
                      <FaEnvelope className={styles.inputIcon} />
                      <span>Correo electrónico *</span>
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={state.formData.email} 
                      onChange={handleChange}
                      className={styles.inputField}
                      placeholder="tucorreo@ejemplo.com"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>
                      <FaPhone className={styles.inputIcon} />
                      <span>Teléfono *</span>
                    </label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={state.formData.phone} 
                      onChange={handleChange}
                      className={styles.inputField}
                      placeholder="+569XXXXXXXX"
                      pattern="\+569\d{8}"
                      title="Formato: +569 seguido de 8 dígitos"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className={styles.sectionTitle}>
              <FaCar /> Información del Vehículo
            </div>

            {state.user ? (
              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>
                  <FaCar className={styles.inputIcon} />
                  <span>Selecciona tu vehículo *</span>
                </label>
                {state.vehicles.length > 0 ? (
                  <>
                    <select 
                      name="vehicleId" 
                      onChange={handleVehicleChange}
                      className={styles.selectField}
                      required
                    >
                      <option value="">Selecciona un vehículo</option>
                      {state.vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.patente} - {v.brand} {v.model} ({v.year})
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <div className={styles.noVehicles}>
                    <p>No tienes vehículos registrados</p>
                    <Link to="/vehicleRegister" className={styles.addVehicleLink}>
                      <FaPlus /> Agregar vehículo
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>
                      <span>Marca</span>
                    </label>
                    <input 
                      type="text" 
                      name="vehicleBrand"
                      value={state.formData.vehicleBrand} 
                      onChange={handleChange}
                      className={styles.inputField}
                      placeholder="Ej: Toyota"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>
                      <span>Modelo</span>
                    </label>
                    <input 
                      type="text" 
                      name="vehicleModel"
                      value={state.formData.vehicleModel} 
                      onChange={handleChange}
                      className={styles.inputField}
                      placeholder="Ej: Corolla"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>
                      <span>Año</span>
                    </label>
                    <input 
                      type="text" 
                      name="vehicleYear"
                      value={state.formData.vehicleYear} 
                      onChange={handleChange}
                      className={styles.inputField}
                      placeholder="Ej: 2020"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>
                      <span>Placa/Patente *</span>
                    </label>
                    <input 
                      type="text" 
                      name="vehiclePlate"
                      value={state.formData.vehiclePlate} 
                      onChange={handleChange}
                      className={styles.inputField}
                      placeholder="Ej: AB123CD"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className={styles.sectionTitle}>
              <FaCalendarAlt /> Selección de Fecha y Hora
            </div>

            <div className={styles.calendarContainer}>
              {/* Contenedor de semanas */}
              <div className={styles.weeksContainer}>
                {[...Array(Math.ceil(state.calendarDays.length / 6))].map((_, weekIndex) => (
                  <div key={weekIndex} className={styles.weekRow}>
                    {state.calendarDays.slice(weekIndex * 6, weekIndex * 6 + 6).map((day, dayIndex) => {
                      const dateStr = day.toISOString().split('T')[0];
                      const isSelected = state.selectedDate?.toISOString().split('T')[0] === dateStr;
                      const isToday = new Date().toDateString() === day.toDateString();
                      const dayName = day.toLocaleDateString('es-CL', { weekday: 'short' });
                      const dayNumber = day.getDate();
                      const monthName = day.toLocaleDateString('es-CL', { month: 'short' });
                      
                      const hasAppointments = state.bookedAppointments.some(
                        app => app.date === dateStr && app.userId !== (state.user?.uid || 'guest')
                      );

                      const isFullyBooked = state.timeSlots.length > 0 && 
                        state.timeSlots.every(slot => !slot.available);

                      return (
                        <div 
                          key={`${weekIndex}-${dayIndex}`}
                          className={`${styles.calendarDay} 
                            ${isSelected ? styles.selected : ''} 
                            ${isToday ? styles.today : ''}
                            ${isFullyBooked ? styles.fullyBooked : ''}`}
                          onClick={() => !isFullyBooked && handleDateSelect(day)}
                        >
                          <div className={styles.dayHeader}>
                            <span className={styles.dayName}>{dayName}</span>
                            <span className={styles.dayNumber}>{dayNumber}</span>
                            <span className={styles.monthName}>{monthName}</span>
                          </div>
                          {hasAppointments && <div className={styles.bookedIndicator}></div>}
                          {isFullyBooked && <div className={styles.fullyBookedLabel}>Completo</div>}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {state.loadingTimeSlots && (
                <div className={styles.loadingTimeSlots}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Cargando horarios disponibles...</p>
                </div>
              )}

              {state.selectedDate && !state.loadingTimeSlots && (
                <div className={styles.timeSlotsContainer}>
                  <h3 className={styles.timeSlotsTitle}>
                    Horarios disponibles para el {state.selectedDate.toLocaleDateString('es-CL', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </h3>
                  <div className={styles.timeSlotsGrid}>
                    {state.timeSlots.map((slot, index) => {
                      const isBooked = !slot.available;
                      const isSelected = state.formData.time === slot.time && !isBooked;
                      const isMyBooking = isBooked && slot.userId === state.user?.uid;
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          className={`
                            ${styles.timeSlot} 
                            ${isBooked ? 
                              (isMyBooking ? styles.myBooked : styles.booked) : 
                              (isSelected ? styles.selectedAvailable : styles.available)}
                          `}
                          onClick={() => !isBooked && handleTimeSelect(slot.time)}
                          disabled={isBooked && !isMyBooking}
                          title={isBooked ? (isMyBooking ? 'Tu reserva' : 'No disponible') : ''}
                        >
                          {slot.time}
                          {isBooked && (
                            <span className={styles.bookedTooltip}>
                              {isMyBooking ? 'Tu reserva' : 'No disponible'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>
                <FaTools className={styles.inputIcon} />
                <span>Servicio *</span>
              </label>
              <select 
                name="service" 
                value={state.formData.service} 
                onChange={handleChange} 
                className={styles.selectField}
                required
              >
                <option value="">Selecciona un servicio</option>
                {services.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.inputLabel}>
                <span>Notas adicionales</span>
              </label>
              <textarea
                name="notes"
                value={state.formData.notes} 
                onChange={handleChange}
                className={styles.textareaField}
                placeholder="Describe cualquier problema específico o requerimiento especial"
                rows="3"
              />
            </div>

            {!state.user && (
              <div className={styles.loginPrompt}>
                <p>¿Ya tienes cuenta? 
                  <Link 
                    to="/login" 
                    state={{ fromAppointment: true }}
                    className={styles.loginLink}
                  >
                    Inicia sesión
                  </Link> para agendar más rápido con tus datos guardados.
                </p>
              </div>
            )}

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={!state.formData.date || !state.formData.time || !state.formData.service}
            >
              {state.user ? 'Confirmar Cita' : 'Agendar como Invitado'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AppointmentPage;