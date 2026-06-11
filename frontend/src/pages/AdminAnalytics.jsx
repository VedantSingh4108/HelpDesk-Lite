import React, { useState, useEffect } from 'react';
import { Inbox, AlertCircle } from 'lucide-react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register the Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function AdminAnalytics() {
  const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('helpdeskToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const { data } = await axios.get('/api/tickets/admin/analytics', config);

        setStats(data.stats);
        setChartData(data.chartData);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="page-content container text-center mt-xl">Loading Analytics Dashboard...</div>;
  if (error) return <div className="page-content container text-center mt-xl text-red-500"><AlertCircle className="inline mr-2" />{error}</div>;

  // --- Configure Chart.js Data ---
  const lineChartData = {
    labels: chartData.map(item => item.date),
    datasets: [
      {
        fill: true,
        label: 'Tickets Created',
        data: chartData.map(item => item.count),
        borderColor: '#3b82f6', // Tailwind blue-500 to match var(--primary)
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // Translucent fill
        tension: 0.4, // Gives it that smooth, curved Recharts look
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3b82f6',
      },
    ],
  };

  // --- Configure Chart.js Options ---
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide the legend for a cleaner look
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)', // Dark slate tooltip
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 14, weight: 'bold' },
        displayColors: false, // Hides the little color box in the tooltip
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide vertical grid lines
        },
        ticks: {
          color: '#64748b', // Text muted
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1, // Only show whole numbers (you can't have half a ticket)
          color: '#64748b',
        },
        grid: {
          borderDash: [4, 4], // Dashed horizontal lines
          color: '#e2e8f0', // Light border color
        }
      }
    }
  };

  return (
    <div className="page-content container">
      <h2 className="text-2xl mb-lg">Admin Analytics</h2>

      {/* Live Stats Cards */}
      <div className="flex gap-lg mb-lg">
        <div className="card" style={{ flex: 1 }}>
          <div className="flex items-center gap-md mb-sm">
            <div style={{ padding: '8px', backgroundColor: 'var(--secondary-bg)', borderRadius: 'var(--radius-std)' }}>
              <Inbox size={20} color="var(--primary)" />
            </div>
            <p className="label">Total Tickets</p>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <div className="flex items-center gap-md mb-sm">
            <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: 'var(--radius-std)' }}>
              <Inbox size={20} color="#1d4ed8" />
            </div>
            <p className="label">Open / In Progress</p>
          </div>
          <p className="text-2xl font-bold">{stats.open}</p>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <div className="flex items-center gap-md mb-sm">
            <div style={{ padding: '8px', backgroundColor: '#d1fae5', borderRadius: 'var(--radius-std)' }}>
              <Inbox size={20} color="#047857" />
            </div>
            <p className="label">Resolved / Closed</p>
          </div>
          <p className="text-2xl font-bold">{stats.resolved}</p>
        </div>
      </div>

      {/* Live Chart.js Interactive Graph */}
      <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        <h3 className="text-lg mb-md">Ticket Volume Trends (Last 7 Days)</h3>

        <div style={{ flex: 1, width: '100%', height: '300px' }}>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted">No ticket data available for the last 7 days.</div>
          ) : (
            <Line data={lineChartData} options={lineChartOptions} />
          )}
        </div>
      </div>
    </div>
  );
}