import { useState, useEffect } from 'react';
import { firestore } from '../../../firebase/firebaseConfig';
import { 
  collection, query, onSnapshot, updateDoc, doc, deleteDoc 
} from 'firebase/firestore';
import { 
  FaChartLine, FaHistory, FaCalendarAlt, 
  FaTasks, FaSignOutAlt, FaCar,
  FaUser, FaEnvelope, FaPhone, FaTools,
  FaCheckCircle, FaArrowLeft, FaChevronLeft,
  FaChevronRight, FaPlus, FaIdCardAlt, FaMoneyBillWave, FaHome
} from 'react-icons/fa';
import styles from './MechanicDashboard.module.scss';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase/firebaseConfig'; 
import { signOut } from 'firebase/auth';
import { ServicesPieChart } from './Graphics/Graphic';

// Precios aproximados de servicios en CLP
const SERVICE_PRICES = {
  'Cambio de aceite': 35000,
  'Rotación de neumáticos': 25000,
  'Revisión de Frenos': 30000,
  'Alineación y balanceo': 40000,
  'Suspensión': 120000,
  'Servicio de transmisión': 60000,
  'Scanner': 30000,
  'Diagnóstico de motor': 50000,
  'Reemplazo de batería': 20000,
  'Mantención preventiva': 90000
};

const MechanicDashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [newDateTime, setNewDateTime] = useState({
    date: '',
    time: ''
  });
  
  // Estados para la agenda
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day');
  const [draggedItem, setDraggedItem] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    service: 'all',
    startDate: '',
    endDate: ''
  });

  const [columns, setColumns] = useState([
    { id: 1, title: "Pendientes", appointments: [] },
    { id: 2, title: "En Proceso", appointments: [] },
    { id: 3, title: "Esperando Repuestos", appointments: [] },
    { id: 4, title: "Completados", appointments: [] }
  ]);

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    // Asegurarse que la fecha se interprete como UTC
    const date = new Date(dateString + 'T12:00:00Z'); // Hora del medio día UTC
    
    // Ajustar a hora local de Chile (UTC-4 o UTC-3)
    const offset = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() + offset);
    
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      timeZone: 'America/Santiago' // Especificar zona horaria de Chile
    };
    
    return date.toLocaleDateString('es-ES', options);
  };

  // Formatear hora
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5); // Mostrar solo HH:MM
  };

  // Obtener precio del servicio
  const getServicePrice = (serviceName) => {
    return SERVICE_PRICES[serviceName] || 0;
  };

  // Cargar vehículos
  useEffect(() => {
    const q = query(collection(firestore, 'vehicles'));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const loadedVehicles = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVehicles(loadedVehicles);
      },
      (error) => {
        console.error("Error loading vehicles:", error);
        setError("Error al cargar vehículos");
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, []);

  // Cargar citas
  useEffect(() => {
    const q = query(collection(firestore, 'appointments'));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const loadedAppointments = querySnapshot.docs.map(doc => {
          const appointmentData = doc.data();
          return {
            id: doc.id,
            ...appointmentData,
            // Asegúrate que el nombre del servicio coincida exactamente con SERVICE_PRICES
            estimatedPrice: getServicePrice(appointmentData.service)
          };
        });
        
        // Ordenar por fecha y hora
        const sortedAppointments = loadedAppointments.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA - dateB;
        });
        
        setAppointments(sortedAppointments);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading appointments:", error);
        setError("Error al cargar citas");
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, []);

  // Filtrar citas para búsquedas
  const filteredAppointments = appointments.filter(app => {
    if (filters.search && 
        !app.client.toLowerCase().includes(filters.search.toLowerCase()) && 
        !app.vehicle.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.service !== 'all' && app.service !== filters.service) {
      return false;
    }
    
    if (filters.startDate || filters.endDate) {
      const appDate = new Date(app.date);
      if (isNaN(appDate.getTime())) return false;
      
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;
      
      if (startDate && appDate < startDate) return false;
      if (endDate && appDate > endDate) return false;
    }
    
    return true;
  });

  // Filtrar citas para la agenda diaria
  const dailyAppointments = appointments.filter(app => {
    // Crear fecha de la cita en UTC (asumiendo formato YYYY-MM-DD)
    const [year, month, day] = app.date.split('-');
    const appDate = new Date(Date.UTC(year, month - 1, day));
    
    // Crear fecha de comparación en UTC
    const compareDate = new Date(Date.UTC(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    ));
    
    // Comparar fechas UTC
    return appDate.getTime() === compareDate.getTime();
  });

  // Filtrar citas para la semana actual
  const weeklyAppointments = appointments.filter(app => {
    const appDate = new Date(app.date);
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return appDate >= startOfWeek && appDate <= endOfWeek;
  });

  // Filtrar citas para el mes actual
  const monthlyAppointments = appointments.filter(app => {
    const appDate = new Date(app.date);
    return (
      appDate.getMonth() === currentDate.getMonth() &&
      appDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Actualizar columnas según estado de citas
  useEffect(() => {
    if (appointments.length > 0) {
      setColumns([
        {
          id: 1,
          title: "Pendientes",
          appointments: appointments
            .filter(app => app.status === "Pendiente")
            .map(app => ({
              id: app.id,
              client: app.client,
              vehicle: app.vehicle,
              service: app.service,
              status: app.status,
              estimatedPrice: app.estimatedPrice
            }))
        },
        {
          id: 2,
          title: "En Proceso",
          appointments: appointments
            .filter(app => app.status === "En Proceso")
            .map(app => ({
              id: app.id,
              client: app.client,
              vehicle: app.vehicle,
              service: app.service,
              status: app.status,
              estimatedPrice: app.estimatedPrice
            }))
        },
        {
          id: 3,
          title: "Esperando Repuestos",
          appointments: appointments
            .filter(app => app.status === "Esperando Repuestos")
            .map(app => ({
              id: app.id,
              client: app.client,
              vehicle: app.vehicle,
              service: app.service,
              status: app.status,
              estimatedPrice: app.estimatedPrice
            }))
        },
        {
          id: 4,
          title: "Completados",
          appointments: appointments
            .filter(app => app.status === "Completado")
            .map(app => ({
              id: app.id,
              client: app.client,
              vehicle: app.vehicle,
              service: app.service,
              status: app.status,
              estimatedPrice: app.estimatedPrice
            }))
        }
      ]);
    }
  }, [appointments]);

  // Funciones para la agenda
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await deleteDoc(doc(firestore, 'appointments', appointmentId));
    } catch (error) {
      console.error("Error canceling appointment:", error);
      setError("Error al cancelar la cita");
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await updateDoc(doc(firestore, 'appointments', appointmentId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      setError("Error al actualizar el estado de la cita");
    }
  };

  // Funciones para el arrastre en el flujo de trabajo
  const handleDragStart = (e, appointmentId, columnId) => {
    setDraggedItem({ appointmentId, columnId });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    if (!draggedItem) return;

    const statusMap = {
      1: "Pendiente",
      2: "En Proceso",
      3: "Esperando Repuestos",
      4: "Completado"
    };
    
    const newStatus = statusMap[targetColumnId];
    
    try {
      await updateDoc(doc(firestore, 'appointments', draggedItem.appointmentId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error moving appointment:", error);
      setError("Error al mover la cita");
    }
    
    setDraggedItem(null);
  };

  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Ocurrió un error al cerrar la sesión');
    }
  };

  // Calcular ingresos de servicios completados
  const calculateCompletedIncome = () => {
    return appointments
      .filter(app => app.status === "Completado")
      .reduce((total, app) => {
        // Verifica que el precio estimado existe y es un número
        const price = Number(app.estimatedPrice) || 0;
        return total + price;
      }, 0);
  };


  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  // Generar días de la semana para vista semanal
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    return Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  // Generar semanas del mes para vista mensual
  const getMonthWeeks = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const weeks = [];
    let currentWeek = [];
    
    // Rellenar días del mes anterior si es necesario
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(firstDay);
      prevDate.setDate(firstDay.getDate() - (firstDay.getDay() - i));
      currentWeek.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Agregar días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      currentWeek.push({ date, isCurrentMonth: true });
      
      if (date.getDay() === 6 || day === lastDay.getDate()) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Rellenar días del siguiente mes si es necesario
    if (currentWeek.length > 0) {
      const nextMonthDay = 1;
      while (currentWeek.length < 7) {
        const date = new Date(year, month + 1, nextMonthDay);
        currentWeek.push({ date, isCurrentMonth: false });
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

    function isSameDay(date1, date2) {
        return (
          date1.getDate() === date2.getDate() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getFullYear() === date2.getFullYear()
        );
      }

   const validateDateTime = () => {
    if (!newDateTime.date || !newDateTime.time) {
      setError("Fecha y hora son requeridos");
      return false;
    }
    
    const selectedDate = new Date(`${newDateTime.date}T${newDateTime.time}`);
    const now = new Date();
    
    if (selectedDate < now) {
      setError("No se puede programar una cita en el pasado");
      return false;
    }
    
    return true;
  };

  const getStatusFromColumnId = (columnId) => {
    const statusMap = {
      1: "Pendiente",
      2: "En Proceso",
      3: "Esperando Repuestos",
      4: "Completado"
    };
    return statusMap[columnId];
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Botón de menú móvil */}
      <button 
        className={styles.mobileMenuButton}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? '×' : '☰'}
      </button>

      <div className={`${styles.sidebar} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.logo}>
          <h2>JMC Repair</h2>
          <p>Panel de Control</p>
        </div>
        
        <nav className={styles.navMenu}>
          <button 
            onClick={() => {
              setActiveTab('analytics');
              setSelectedAppointment(null);
              setSelectedVehicle(null);
            }}
            className={activeTab === 'analytics' ? styles.active : ''}
          >
            <FaChartLine /> Análisis
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('history');
              setSelectedAppointment(null);
              setSelectedVehicle(null);
            }}
            className={activeTab === 'history' ? styles.active : ''}
          >
            <FaHistory /> Historial
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('schedule');
              setSelectedAppointment(null);
              setSelectedVehicle(null);
            }}
            className={activeTab === 'schedule' ? styles.active : ''}
          >
            <FaCalendarAlt /> Agenda
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('workflow');
              setSelectedAppointment(null);
              setSelectedVehicle(null);
            }}
            className={activeTab === 'workflow' ? styles.active : ''}
          >
            <FaTasks /> Flujo de Trabajo
          </button>

          <button 
            onClick={() => {
              setActiveTab('vehicles');
              setSelectedAppointment(null);
              setSelectedVehicle(null);
            }}
            className={activeTab === 'vehicles' ? styles.active : ''}
          >
            <FaCar /> Vehículos
          </button>
        </nav>
        
        <div className={styles.footer}>
          <button onClick={() => navigate('/')} className={styles.settingsBtn}>
            <FaHome /> Página Principal
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </div>
      </div>
      
      <div className={styles.mainContent}>
        {activeTab === 'analytics' && (
          <div className={styles.analyticsContainer}>
            <h2>Análisis de Servicios</h2>
            <div className={styles.analyticsRow}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Citas este mes</h3>
                <p>
                  {appointments.filter(a => {
                    const appDate = new Date(`${a.date} ${a.time}`);
                    const now = new Date();
                    return appDate.getMonth() === now.getMonth() && 
                          appDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              
              <div className={styles.statCard}>
                <h3>Servicio más solicitado</h3>
                <p>
                  {appointments.length > 0 
                    ? [...new Set(appointments.map(a => a.service))]
                        .map(service => ({
                          service,
                          count: appointments.filter(a => a.service === service).length
                        }))
                        .sort((a, b) => b.count - a.count)[0]?.service 
                    : 'N/A'
                  }
                </p>
              </div>
              
              <div className={styles.statCard}>
                <h3>Ingresos totales</h3>
                <p>${calculateCompletedIncome().toLocaleString('es-CL')}</p>
                  <span>
                    {appointments.filter(a => a.status === "Completado").length} servicios
                  </span>
              </div>
            </div>
            
            <div className={styles.chartsContainer}>
              <div className={styles.chartWrapper}>
                <div className={styles.chartPlaceholder}>
                  <ServicesPieChart appointments={appointments} />
                </div>
              </div>
            </div>
            </div>
            
            <div className={styles.serviceTable}>
              <h3>Detalle de servicios</h3>
              <table>
                <thead>
                  <tr>
                    <th>Servicio</th>
                    <th>Cantidad</th>
                    <th>Ingresos</th>
                    <th>Tiempo promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {[...new Set(appointments.map(a => a.service))].map(service => (
                    <tr key={service}>
                      <td>{service}</td>
                      <td>{appointments.filter(a => a.service === service).length}</td>
                      <td>${appointments
                        .filter(a => a.service === service)
                        .reduce((sum, app) => sum + (app.estimatedPrice || 0), 0)
                        .toLocaleString('es-CL')}
                      </td>
                      <td>60 min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className={styles.historyContainer}>
            {selectedAppointment ? (
              <div className={styles.appointmentDetail}>
                <button 
                  onClick={() => setSelectedAppointment(null)}
                  className={styles.backButton}
                >
                  <FaArrowLeft /> Volver al historial
                </button>
                
                <h2>Detalle de Atención</h2>
                
                <div className={styles.detailSections}>
                  <div className={styles.detailSection}>
                    <h3><FaUser /> Datos del Cliente</h3>
                    <p><strong>Nombre:</strong> {selectedAppointment.client}</p>
                    {selectedAppointment.email && (
                      <p><strong>Correo:</strong> {selectedAppointment.email}</p>
                    )}
                    {selectedAppointment.phone && (
                      <p><strong>Teléfono:</strong> {selectedAppointment.phone}</p>
                    )}
                  </div>
                  
                  <div className={styles.detailSection}>
                    <h3><FaCar /> Vehículo</h3>
                    <p><strong>Vehículo:</strong> {selectedAppointment.vehicle}</p>
                    {selectedAppointment.vehicleBrand && (
                      <p><strong>Marca:</strong> {selectedAppointment.vehicleBrand}</p>
                    )}
                    {selectedAppointment.vehicleModel && (
                      <p><strong>Modelo:</strong> {selectedAppointment.vehicleModel}</p>
                    )}
                    {selectedAppointment.vehicleYear && (
                      <p><strong>Año:</strong> {selectedAppointment.vehicleYear}</p>
                    )}
                  </div>
                  
                  <div className={styles.detailSection}>
                    <h3><FaTools /> Servicio</h3>
                    <p><strong>Tipo:</strong> {selectedAppointment.service}</p>
                    <p><strong>Fecha:</strong> {formatDate(selectedAppointment.date)} a las {formatTime(selectedAppointment.time)}</p>
                    <p><strong>Estado:</strong> 
                      <select
                        value={selectedAppointment.status}
                        onChange={(e) => updateAppointmentStatus(selectedAppointment.id, e.target.value)}
                        className={styles.statusSelect}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Esperando Repuestos">Esperando Repuestos</option>
                        <option value="Completado">Completado</option>
                      </select>
                    </p>
                    <p><strong>Precio estimado:</strong> ${(selectedAppointment.estimatedPrice || 0).toLocaleString('es-CL')}</p>
                    <p><strong>Notas:</strong> {selectedAppointment.notes || 'Ninguna'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h2>Historial de Atenciones</h2>
                <div className={styles.filters}>
                  <input 
                    type="text" 
                    placeholder="Buscar por patente o cliente..." 
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    value={filters.search}
                  />
                  <select 
                    onChange={(e) => setFilters({...filters, service: e.target.value})}
                    value={filters.service}
                  >
                    <option value="all">Todos los servicios</option>
                    {[...new Set(appointments.map(a => a.service))].map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                  <input 
                    type="date" 
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    value={filters.startDate}
                  />
                  <input 
                    type="date" 
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    value={filters.endDate}
                  />
                </div>
                
                <table className={`${styles.historyTable} ${styles.responsiveTable}`}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Vehículo</th>
                      <th>Servicio</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map(appointment => (
                      <tr 
                        key={appointment.id} 
                        onClick={() => setSelectedAppointment(appointment)}
                        className={styles.clickableRow}
                      >
                        <td>{formatDate(appointment.date)}</td>
                        <td>{appointment.client}</td>
                        <td>{appointment.vehicle}</td>
                        <td>{appointment.service}</td>
                        <td>${(appointment.estimatedPrice || 0).toLocaleString('es-CL')}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles[appointment.status.toLowerCase().replace(/\s+/g, '-')]}`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className={styles.detailButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(appointment);
                            }}
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
        
        {activeTab === 'schedule' && (
          <div className={styles.scheduleContainer}>
            <h2>Administración de Agenda</h2>
            
            <div className={styles.scheduleControls}>
              <div className={styles.dateNavigation}>
                {viewMode === 'day' && (
                  <>
                    <button onClick={goToPreviousDay}><FaChevronLeft /></button>
                    <button onClick={goToToday} className={styles.todayButton}>
                      Hoy
                    </button>
                    <h3>
                      {currentDate.toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h3>
                    <button onClick={goToNextDay}><FaChevronRight /></button>
                  </>
                )}
                {viewMode === 'week' && (
                  <>
                    <button onClick={goToPreviousWeek}><FaChevronLeft /></button>
                    <button onClick={goToToday} className={styles.todayButton}>
                      Hoy
                    </button>
                    <h3>
                      Semana del {getWeekDays()[0].toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'long' 
                      })} al {getWeekDays()[6].toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h3>
                    <button onClick={goToNextWeek}><FaChevronRight /></button>
                  </>
                )}
                {viewMode === 'month' && (
                  <>
                    <button onClick={goToPreviousMonth}><FaChevronLeft /></button>
                    <button onClick={goToToday} className={styles.todayButton}>
                      Hoy
                    </button>
                    <h3>
                      {currentDate.toLocaleDateString('es-ES', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h3>
                    <button onClick={goToNextMonth}><FaChevronRight /></button>
                  </>
                )}
              </div>
              
              <div className={styles.viewOptions}>
                <button 
                  className={viewMode === 'day' ? styles.active : ''}
                  onClick={() => setViewMode('day')}
                >
                  Día
                </button>
                <button 
                  className={viewMode === 'week' ? styles.active : ''}
                  onClick={() => setViewMode('week')}
                >
                  Semana
                </button>
                <button 
                  className={viewMode === 'month' ? styles.active : ''}
                  onClick={() => setViewMode('month')}
                >
                  Mes
                </button>
              </div>
              
              {/* <button className={styles.addSlotBtn}>
                <FaPlus /> Agregar Horario
              </button> */}
            </div>
            
            {viewMode === 'day' && (
              <>
                <div className={styles.calendarView}>
                  <div className={styles.timeSlots}>
                    {Array.from({length: 10}, (_, i) => 8 + i).map(hour => (
                      <div key={hour} className={styles.timeSlot}>
                        <div className={styles.timeLabel}>{hour}:00</div>
                        <div className={styles.appointmentSlot}>
                          {dailyAppointments
                            .filter(app => {
                              const appHour = parseInt(app.time.split(':')[0]);
                              return appHour === hour;
                            })
                            .map(app => (
                              <div key={app.id} className={styles.scheduledAppointment}>
                                {editingAppointment?.id === app.id ? (
                                  <div className={styles.editForm}>
                                    <div className={styles.formRow}>
                                      <div className={styles.formGroup}>
                                        <label>Fecha:</label>
                                        <input
                                          type="date"
                                          value={newDateTime.date}
                                          onChange={(e) => setNewDateTime({...newDateTime, date: e.target.value})}
                                          className={styles.formInput}
                                        />
                                      </div>
                                      <div className={styles.formGroup}>
                                        <label>Hora:</label>
                                        <input
                                          type="time"
                                          value={newDateTime.time}
                                          onChange={(e) => setNewDateTime({...newDateTime, time: e.target.value})}
                                          className={styles.formInput}
                                        />
                                      </div>
                                    </div>
                                    <div className={styles.formActions}>
                                      <button 
                                        className={styles.saveButton}
                                        onClick={async () => {
                                          if (!validateDateTime()) return;
                                          
                                          try {
                                            await updateDoc(doc(firestore, 'appointments', editingAppointment.id), {
                                              date: newDateTime.date,
                                              time: newDateTime.time
                                            });
                                            setEditingAppointment(null);
                                          } catch (error) {
                                            console.error("Error updating appointment:", error);
                                            setError("Error al actualizar la cita");
                                          }
                                        }}
                                      >
                                        Guardar
                                      </button>
                                      <button 
                                        className={styles.cancelButton}
                                        onClick={() => setEditingAppointment(null)}
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <strong>{app.service}</strong>
                                    <p>{app.vehicle} - {app.client}</p>
                                    <p>${(app.estimatedPrice || 0).toLocaleString('es-CL')}</p>
                                    <div className={styles.appointmentActions}>
                                      <button 
                                        className={styles.editButton}
                                        onClick={() => {
                                          setEditingAppointment(app);
                                          setNewDateTime({
                                            date: app.date,
                                            time: app.time
                                          });
                                        }}
                                      >
                                        Editar
                                      </button>
                                      <button 
                                        className={styles.cancelButton}
                                        onClick={() => handleCancelAppointment(app.id)}
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.appointmentList}>
                  <h3>Citas programadas - {currentDate.toLocaleDateString('es-ES')}</h3>
                  {dailyAppointments.length > 0 ? (
                    <ul>
                      {dailyAppointments
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map(app => (
                          <li key={app.id}>
                            <div className={styles.appointmentInfo}>
                              <strong>{formatTime(app.time)}</strong> - {app.service} ({app.vehicle})
                              <span className={`${styles.statusBadge} ${styles[app.status.toLowerCase().replace(/\s+/g, '-')]}`}>
                                {app.status}
                              </span>
                              <span className={styles.priceTag}>
                                ${(app.estimatedPrice || 0).toLocaleString('es-CL')}
                              </span>
                            </div>
                            <div className={styles.appointmentActions}>
                              <button 
                                        className={styles.editButton}
                                        onClick={() => {
                                          setEditingAppointment(app);
                                          setNewDateTime({
                                            date: app.date,
                                            time: app.time
                                          });
                                        }}
                                      >
                                        Reagendar
                                      </button>
                              <button onClick={() => handleCancelAppointment(app.id)}>
                                Cancelar
                              </button>
                            </div>
                          </li>
                        ))
                      }
                    </ul>
                  ) : (
                    <p className={styles.noAppointments}>No hay citas programadas para este día</p>
                  )}
                </div>
              </>
            )}
            
          {viewMode === 'week' && (
          <div className={styles.weekView}>
            <div className={styles.weekHeader}>
              {getWeekDays().map((day, index) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div 
                    key={index} 
                    className={`${styles.weekDayHeader} ${isToday ? styles.today : ''}`}
                  >
                    <div className={styles.weekDayName}>
                      {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                    </div>
                    <div className={styles.weekDayNumber}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className={styles.weekGrid}>
              {getWeekDays().map((day, dayIndex) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div 
                    key={dayIndex} 
                    className={`${styles.weekDayColumn} ${isToday ? styles.today : ''}`}
                  >
                    {Array.from({length: 10}, (_, i) => 8 + i).map(hour => (
                      <div key={hour} className={styles.weekTimeSlot}>
                        <div className={styles.weekTimeLabel}>{hour}:00</div>
                        <div className={styles.weekAppointmentSlot}>
                          {weeklyAppointments
                            .filter(app => {
                              const appDate = new Date(app.date);
                              const appHour = parseInt(app.time.split(':')[0]);
                              return (
                                appDate.getDate() === day.getDate() &&
                                appDate.getMonth() === day.getMonth() &&
                                appDate.getFullYear() === day.getFullYear() &&
                                appHour === hour
                              );
                            })
                            .map(app => (
                              <div 
                                key={app.id} 
                                className={styles.weekAppointment}
                                onClick={() => setSelectedAppointment(app)}
                                title={`${app.service} - ${app.vehicle}`}
                              >
                                <strong>{app.service}</strong>
                                <p>{app.vehicle}</p>
                                <p>{app.time.split(':')[0]}:{app.time.split(':')[1]}</p>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
            
            {viewMode === 'month' && (
              <div className={styles.monthView}>
                <div className={styles.monthGrid}>
                  {getMonthWeeks().map((week, weekIndex) => (
                    <div key={weekIndex} className={styles.monthWeek}>
                      {week.map((day, dayIndex) => (
                        <div 
                          key={dayIndex} 
                          className={`${styles.monthDay} ${day.isCurrentMonth ? '' : styles.otherMonth}`}
                        >
                          <div className={styles.monthDayHeader}>
                            {day.date.getDate()}
                          </div>
                          <div className={styles.monthAppointments}>
                            {monthlyAppointments
                              .filter(app => {
                                const appDate = new Date(app.date);
                                return (
                                  appDate.getDate() === day.date.getDate() &&
                                  appDate.getMonth() === day.date.getMonth() &&
                                  appDate.getFullYear() === day.date.getFullYear()
                                );
                              })
                              .map(app => (
                                <div key={app.id} className={styles.monthAppointment}>
                                  <span>{formatTime(app.time)}</span> {app.service}
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'workflow' && (
          <div className={styles.workflowContainer}>
            <h2>Flujo de Trabajo</h2>
            
            <div className={styles.kanbanBoard}>
              {columns.map(column => (
                <div 
                  key={column.id} 
                  className={styles.kanbanColumn}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <h3>{column.title} ({column.appointments.length})</h3>
                  
                  <div className={styles.kanbanCards}>
                    {column.appointments.map(appointment => (
                      <div 
                        key={appointment.id} 
                        className={styles.kanbanCard}
                        draggable
                        onDragStart={(e) => handleDragStart(e, appointment.id, column.id)}
                      >
                        <div className={styles.cardHeader}>
                          <h4>{appointment.service}</h4>
                          <span className={styles.currentStatus}>
                            {appointment.status}
                          </span>
                        </div>
                        
                        <p>{appointment.client}</p>
                        <p>{appointment.vehicle}</p>
                        <p className={styles.cardPrice}>
                          <FaMoneyBillWave /> ${(appointment.estimatedPrice || 0).toLocaleString('es-CL')}
                        </p>
                        
                        {/* Opciones solo en móvil */}
                        <div className={styles.mobileStatusOptions}>
                          <select
                            className={styles.statusSelect}
                            onChange={(e) => updateAppointmentStatus(appointment.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            defaultValue=""
                          >
                            <option value="" disabled>Cambiar estado...</option>
                            {columns.filter(c => c.id !== column.id).map(targetColumn => (
                              <option 
                                key={targetColumn.id}
                                value={getStatusFromColumnId(targetColumn.id)}
                              >
                                Mover a {targetColumn.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div className={styles.vehiclesContainer}>
            {selectedVehicle ? (
              <div className={styles.vehicleDetail}>
                <button 
                  onClick={() => setSelectedVehicle(null)}
                  className={styles.backButton}
                >
                  <FaArrowLeft /> Volver a la lista
                </button>
                
                <h2>Detalles del Vehículo</h2>
                
                <div className={styles.detailSections}>
                  <div className={styles.detailSection}>
                    <h3><FaCar /> Información Básica</h3>
                    <p><strong>Patente:</strong> {selectedVehicle.patente}</p>
                    <p><strong>Marca/Modelo:</strong> {selectedVehicle.brand} {selectedVehicle.model}</p>
                    <p><strong>Año:</strong> {selectedVehicle.year}</p>
                    {selectedVehicle.color && <p><strong>Color:</strong> {selectedVehicle.color}</p>}
                    {selectedVehicle.vin && <p><strong>VIN:</strong> {selectedVehicle.vin}</p>}
                  </div>
                  
                  <div className={styles.detailSection}>
                    <h3><FaUser /> Dueño</h3>
                    <p><strong>Nombre:</strong> {selectedVehicle.userName}</p>
                    <p><strong>Email:</strong> {selectedVehicle.userEmail}</p>
                    {selectedVehicle.userPhone && <p><strong>Teléfono:</strong> {selectedVehicle.userPhone}</p>}
                  </div>
                  
                  <div className={styles.detailSection}>
                    <h3><FaTools /> Servicios Recientes</h3>
                    {appointments.filter(a => a.vehicle === selectedVehicle.patente).length > 0 ? (
                      <ul className={styles.serviceList}>
                        {appointments
                          .filter(a => a.vehicle === selectedVehicle.patente)
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .slice(0, 5)
                          .map(app => (
                            <li key={app.id} className={styles.serviceItem}>
                              <span className={styles.serviceDate}>{formatDate(app.date)}</span>
                              <span className={styles.serviceName}>{app.service}</span>
                              <span className={styles.servicePrice}>${(app.estimatedPrice || 0).toLocaleString('es-CL')}</span>
                              <span className={`${styles.statusBadge} ${styles[app.status.toLowerCase().replace(/\s+/g, '-')]}`}>
                                {app.status}
                              </span>
                            </li>
                          ))
                        }
                      </ul>
                    ) : (
                      <p>No hay servicios registrados para este vehículo</p>
                    )}
                  </div>

                  {selectedVehicle.notes && (
                    <div className={styles.detailSection}>
                      <h3><FaIdCardAlt /> Notas</h3>
                      <p>{selectedVehicle.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <h2>Vehículos Registrados</h2>
                
                <div className={styles.filters}>
                  <input 
                    type="text" 
                    placeholder="Buscar por patente, marca o modelo..." 
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    value={filters.search}
                  />
                </div>
                
                <table className={styles.vehiclesTable}>
                  <thead>
                    <tr>
                      <th>Patente</th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th>Año</th>
                      <th>Dueño</th>
                      <th>Servicios</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.filter(vehicle => 
                      filters.search === '' || 
                      vehicle.patente.toLowerCase().includes(filters.search.toLowerCase()) || 
                      vehicle.brand.toLowerCase().includes(filters.search.toLowerCase()) || 
                      vehicle.model.toLowerCase().includes(filters.search.toLowerCase())
                    ).map(vehicle => (
                      <tr 
                        key={vehicle.id} 
                        onClick={() => setSelectedVehicle(vehicle)}
                        className={styles.clickableRow}
                      >
                        <td>{vehicle.patente}</td>
                        <td>{vehicle.brand}</td>
                        <td>{vehicle.model}</td>
                        <td>{vehicle.year}</td>
                        <td>{vehicle.userName}</td>
                        <td>
                          {appointments.filter(a => a.vehicle === vehicle.patente).length}
                        </td>
                        <td>
                          <button 
                            className={styles.detailButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVehicle(vehicle);
                            }}
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MechanicDashboard;