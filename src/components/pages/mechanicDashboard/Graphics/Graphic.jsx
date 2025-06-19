import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import styles from '../Graphics/Graphic.module.scss';

// Registra los componentes necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export const ServicesPieChart = ({ appointments }) => {
  // Filtra las citas del mes actual
  const currentMonthAppointments = appointments.filter(app => {
    const appDate = new Date(app.date);
    const now = new Date();
    return (
      appDate.getMonth() === now.getMonth() &&
      appDate.getFullYear() === now.getFullYear()
    );
  });

  // Agrupa por tipo de servicio
  const serviceCounts = currentMonthAppointments.reduce((acc, app) => {
    acc[app.service] = (acc[app.service] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(serviceCounts),
    datasets: [
      {
        data: Object.values(serviceCounts),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#8AC24A', '#607D8B',
          '#E91E63', '#9C27B0'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className={styles.graphicContainer}>
      <h3>Distribución de Servicios este Mes</h3>
      <div className={styles.graphicData}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};