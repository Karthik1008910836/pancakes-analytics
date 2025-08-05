import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Chip
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { salesApi } from '../utils/api';
import { format, parseISO } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendData {
  date: string;
  total_tickets: number;
  offline_tickets: number;
  online_tickets: number;
  cakes_sold: number;
  pastries_sold: number;
  net_sale: number;
  daily_target: number;
}

interface TrendSummary {
  total_days: number;
  avg_total_tickets: string;
  avg_online_tickets: string;
  avg_offline_tickets: string;
  avg_cakes_sold: string;
  avg_pastries_sold: string;
}

const DailyTrends: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [summary, setSummary] = useState<TrendSummary | null>(null);
  const [period, setPeriod] = useState<number>(30);

  useEffect(() => {
    fetchTrends();
  }, [period]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await salesApi.getDailyTrends({ days: period });
      
      if (response.success && response.data) {
        setTrends(response.data.trends);
        setSummary(response.data.summary);
      } else {
        setError(response.message || 'Failed to fetch trends data');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch trends data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartLabels = trends.map(item => format(parseISO(item.date), 'MMM dd'));
  
  // Tickets trend chart (Line chart)
  const ticketsChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Total Tickets',
        data: trends.map(item => item.total_tickets),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Online Tickets',
        data: trends.map(item => item.online_tickets),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Offline Tickets',
        data: trends.map(item => item.offline_tickets),
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }
    ]
  };

  // Products sold chart (Bar chart)
  const productsChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Cakes Sold',
        data: trends.map(item => item.cakes_sold),
        backgroundColor: '#e91e63',
        borderColor: '#c2185b',
        borderWidth: 1
      },
      {
        label: 'Pastries Sold',
        data: trends.map(item => item.pastries_sold),
        backgroundColor: '#9c27b0',
        borderColor: '#7b1fa2',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading trends data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Period Selection */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          📊 Kompally Store - Daily Trends
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={period}
            label="Period"
            onChange={(e) => setPeriod(Number(e.target.value))}
          >
            <MenuItem value={7}>Last 7 Days</MenuItem>
            <MenuItem value={14}>Last 14 Days</MenuItem>
            <MenuItem value={30}>Last 30 Days</MenuItem>
            <MenuItem value={60}>Last 60 Days</MenuItem>
            <MenuItem value={90}>Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom>
                Days Analyzed
              </Typography>
              <Typography variant="h5" color="primary">
                {summary.total_days}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom>
                Avg Total Tickets
              </Typography>
              <Typography variant="h5" color="primary">
                {summary.avg_total_tickets}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom>
                Avg Online Tickets
              </Typography>
              <Typography variant="h5" color="success.main">
                {summary.avg_online_tickets}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom>
                Avg Offline Tickets
              </Typography>
              <Typography variant="h5" color="warning.main">
                {summary.avg_offline_tickets}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom>
                Avg Products/Day
              </Typography>
              <Typography variant="h6" color="secondary.main">
                <Chip label={`${summary.avg_cakes_sold} Cakes`} size="small" sx={{ mr: 0.5 }} />
                <Chip label={`${summary.avg_pastries_sold} Pastries`} size="small" />
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Tickets Trend Chart */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎫 Daily Tickets Trend (Online vs Offline)
              </Typography>
              <Box sx={{ height: 400 }}>
                <Line data={ticketsChartData} options={chartOptions} />
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Track your daily ticket sales with breakdown of online and offline channels
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Products Sold Chart */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🧁 Daily Products Sold (Cakes vs Pastries)
              </Typography>
              <Box sx={{ height: 400 }}>
                <Bar data={productsChartData} options={chartOptions} />
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Monitor your daily product mix and identify popular items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {trends.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No data available for the selected period
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Add some sales entries to see trends
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DailyTrends;