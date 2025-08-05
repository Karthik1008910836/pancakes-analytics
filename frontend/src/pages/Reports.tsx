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
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  TextField,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { salesApi, outletsApi } from '../utils/api';
import { DailySales, Outlet, MTDSummary } from '../types';
import DailyTrends from '../components/DailyTrends';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [salesData, setSalesData] = useState<DailySales[]>([]);
  const [mtdSummary, setMtdSummary] = useState<MTDSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);

  const [filters, setFilters] = useState({
    outlet_id: isAdmin ? '' : user?.outlet_id?.toString() || '',
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    report_type: 'daily_sales',
  });

  useEffect(() => {
    fetchOutlets();
    fetchReportData();
  }, []);

  const fetchOutlets = async () => {
    try {
      const response = await outletsApi.getOutlets();
      setOutlets(response.data || []);
    } catch (error) {
      console.error('Error fetching outlets:', error);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Fetch sales data
      const salesParams: any = {
        start_date: filters.start_date,
        end_date: filters.end_date,
        limit: 100,
        sort_by: 'date',
        sort_order: 'ASC',
      };

      if (filters.outlet_id) {
        salesParams.outlet_id = parseInt(filters.outlet_id);
      }

      const salesResponse = await salesApi.getEntries(salesParams);
      setSalesData(salesResponse.data?.entries || []);

      // Fetch MTD summary
      const currentDate = new Date();
      const mtdParams: any = {
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
      };

      if (filters.outlet_id) {
        mtdParams.outlet_id = parseInt(filters.outlet_id);
      }

      const mtdResponse = await salesApi.getMTDSummary(mtdParams);
      setMtdSummary(mtdResponse.data?.summary || []);

      // Show success message
      const entriesCount = salesResponse.data?.entries?.length || 0;
      setSuccess(`✅ Report generated successfully! Found ${entriesCount} sales records for the selected period.`);
      
      // Auto-dismiss success message after 4 seconds
      setTimeout(() => {
        setSuccess('');
      }, 4000);

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch report data';
      setError(`❌ Error: ${errorMessage}. Please check your filters and try again.`);
      
      // Auto-dismiss error message after 8 seconds
      setTimeout(() => {
        setError('');
      }, 8000);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field: 'start_date' | 'end_date') => (date: Date | null) => {
    if (date) {
      setFilters(prev => ({
        ...prev,
        [field]: format(date, 'yyyy-MM-dd')
      }));
    }
  };

  // Chart data preparation
  const dailySalesChartData = {
    labels: salesData.map(item => format(new Date(item.date), 'MMM dd')),
    datasets: [
      {
        label: 'Net Sale',
        data: salesData.map(item => item.net_sale),
        borderColor: 'rgb(255, 152, 0)',
        backgroundColor: 'rgba(255, 152, 0, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Target',
        data: salesData.map(item => item.daily_target),
        borderColor: 'rgb(76, 175, 80)',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderDash: [5, 5],
        tension: 0.1,
      },
    ],
  };

  const outletComparisonData = {
    labels: mtdSummary.map(item => item.outlet.name),
    datasets: [
      {
        label: 'Achievement %',
        data: mtdSummary.map(item => parseFloat(item.achievement_percentage.toString())),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
      },
    ],
  };

  const productSalesData = {
    labels: ['Cakes', 'Pastries'],
    datasets: [
      {
        data: [
          salesData.reduce((sum, item) => sum + item.cakes_sold, 0),
          salesData.reduce((sum, item) => sum + item.pastries_sold, 0),
        ],
        backgroundColor: [
          'rgba(255, 152, 0, 0.8)',
          'rgba(156, 39, 176, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          99 Pancakes Kompally - Reports & Analytics
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="reports tabs">
            <Tab label="📈 Daily Trends" />
            <Tab label="📊 Sales Reports" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Box>
            <DailyTrends />
          </Box>
        )}

        {tabValue === 1 && (
          <Box>

        {/* Filters */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Report Filters
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Start Date"
                  value={new Date(filters.start_date)}
                  onChange={handleDateChange('start_date')}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="End Date"
                  value={new Date(filters.end_date)}
                  onChange={handleDateChange('end_date')}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Outlet"
                  value="99 Pancakes Kompally"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  onClick={fetchReportData}
                  disabled={loading}
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  {loading ? 'Loading...' : 'Generate Report'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Sales Trend
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line data={dailySalesChartData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Product Sales Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Pie data={productSalesData} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>


        {/* Detailed Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Detailed Sales Report
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Gross Sale</TableCell>
                    <TableCell align="right">Net Sale</TableCell>
                    <TableCell align="right">Target</TableCell>
                    <TableCell align="right">Achievement</TableCell>
                    <TableCell align="right">Tickets</TableCell>
                    <TableCell align="right">APC</TableCell>
                    <TableCell align="right">Cakes</TableCell>
                    <TableCell align="right">Pastries</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesData.map((sale) => {
                    const achievement = sale.daily_target > 0 
                      ? ((sale.net_sale / sale.daily_target) * 100).toFixed(1)
                      : '0';
                    
                    return (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {format(new Date(sale.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell align="right">₹{sale.gross_sale.toLocaleString()}</TableCell>
                        <TableCell align="right">₹{sale.net_sale.toLocaleString()}</TableCell>
                        <TableCell align="right">₹{sale.daily_target.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${achievement}%`}
                            color={parseFloat(achievement) >= 100 ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{sale.total_tickets}</TableCell>
                        <TableCell align="right">₹{sale.apc}</TableCell>
                        <TableCell align="right">{sale.cakes_sold}</TableCell>
                        <TableCell align="right">{sale.pastries_sold}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h5">
                  ₹{salesData.reduce((sum, item) => sum + item.net_sale, 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Total Tickets
                </Typography>
                <Typography variant="h5">
                  {salesData.reduce((sum, item) => sum + item.total_tickets, 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Average APC
                </Typography>
                <Typography variant="h5">
                  ₹{salesData.length > 0 
                    ? (salesData.reduce((sum, item) => sum + parseFloat(item.apc.toString()), 0) / salesData.length).toFixed(0)
                    : 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>
                  Total Products
                </Typography>
                <Typography variant="h5">
                  {salesData.reduce((sum, item) => sum + item.cakes_sold + item.pastries_sold, 0).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default Reports;