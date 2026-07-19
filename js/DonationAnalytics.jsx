import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import { TrendingUp, DollarSign, Users, Target } from '@mui/icons-material';

const DonationAnalytics = ({ donations = [], interns = [] }) => {
  const analytics = useMemo(() => {
    // Calculate totals
    const totalDonations = donations.length;
    const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalInterns = interns.length;
    const activeInterns = interns.filter(i => i.status === 'active').length;

    // Monthly breakdown
    const monthlyData = {};
    donations.forEach(d => {
      const date = new Date(d.createdAt);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, donations: 0, amount: 0 };
      }
      monthlyData[month].donations += 1;
      monthlyData[month].amount += d.amount || 0;
    });
    const monthlyChart = Object.values(monthlyData).slice(-6);

    // Donation size distribution
    const sizeDistribution = {
      '< 500': donations.filter(d => d.amount < 500).length,
      '500-1000': donations.filter(d => d.amount >= 500 && d.amount < 1000).length,
      '1000-5000': donations.filter(d => d.amount >= 1000 && d.amount < 5000).length,
      '5000-10000': donations.filter(d => d.amount >= 5000 && d.amount < 10000).length,
      '> 10000': donations.filter(d => d.amount >= 10000).length,
    };

    // Top performing interns
    const internPerformance = interns
      .map(intern => ({
        name: intern.name,
        raised: intern.totalRaised || 0,
        goal: 30000,
        progress: Math.round(((intern.totalRaised || 0) / 30000) * 100),
        referralCode: intern.referralCode,
      }))
      .sort((a, b) => b.raised - a.raised)
      .slice(0, 10);

    // Payment method breakdown
    const paymentMethods = {
      'Razorpay': donations.filter(d => d.paymentMethod === 'razorpay').length,
      'Bank Transfer': donations.filter(d => d.paymentMethod === 'bank').length,
      'Manual': donations.filter(d => d.paymentMethod === 'manual').length,
    };

    // Daily trend
    const dailyTrend = {};
    donations.forEach(d => {
      const date = new Date(d.createdAt).toLocaleDateString();
      if (!dailyTrend[date]) {
        dailyTrend[date] = 0;
      }
      dailyTrend[date] += d.amount || 0;
    });
    const trendChart = Object.entries(dailyTrend)
      .slice(-30)
      .map(([date, amount]) => ({ date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), amount }));

    // Campaign performance
    const campaignPerformance = {};
    donations.forEach(d => {
      const campaign = d.campaignId || 'Direct Donation';
      if (!campaignPerformance[campaign]) {
        campaignPerformance[campaign] = 0;
      }
      campaignPerformance[campaign] += d.amount || 0;
    });

    return {
      totalDonations,
      totalAmount,
      totalInterns,
      activeInterns,
      monthlyChart,
      sizeDistribution,
      internPerformance,
      paymentMethods,
      trendChart,
      campaignPerformance,
      avgDonation: totalDonations > 0 ? Math.round(totalAmount / totalDonations) : 0,
    };
  }, [donations, interns]);

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0'];

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="caption">
              {label}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <TrendingUp sx={{ fontSize: 16, color: '#4CAF50' }} />
                <Typography variant="caption" sx={{ color: '#4CAF50' }}>
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Icon sx={{ fontSize: 32, color, opacity: 0.3 }} />
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 2, backgroundColor: '#fafafa', borderRadius: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Donation Analytics
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={DollarSign}
            label="Total Raised"
            value={`₹${analytics.totalAmount.toLocaleString()}`}
            color="#4CAF50"
            trend={`Avg: ₹${analytics.avgDonation.toLocaleString()}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Users}
            label="Total Donors"
            value={analytics.totalDonations}
            color="#2196F3"
            trend={`${Math.round((analytics.totalDonations / (analytics.totalInterns || 1)) * 10) / 10}x per intern`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Target}
            label="Active Interns"
            value={analytics.activeInterns}
            color="#FF9800"
            trend={`of ${analytics.totalInterns}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TrendingUp}
            label="Avg Goal Progress"
            value={`${Math.round((analytics.internPerformance.reduce((sum, i) => sum + i.progress, 0) / analytics.internPerformance.length) || 0)}%`}
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Monthly Donation Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Monthly Donation Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Amount (₹)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="donations" fill="#2196F3" name="Donation Count" />
                <Bar yAxisId="right" dataKey="amount" fill="#4CAF50" name="Amount (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Donation Size Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Donation Size Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(analytics.sizeDistribution).map(([key, value]) => ({
                    name: key,
                    value,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Daily Trend Line */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Daily Donation Trend (Last 30 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.trendChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Payment Methods
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {Object.entries(analytics.paymentMethods).map(([method, count]) => (
                <Box key={method}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{method}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {count}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(count / analytics.totalDonations) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Performers Table */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Top Performing Interns
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Referral Code</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  Raised
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Progress</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analytics.internPerformance.map((intern, index) => (
                <TableRow key={intern.referralCode}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{index + 1}</TableCell>
                  <TableCell>{intern.name}</TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        backgroundColor: '#f0f0f0',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {intern.referralCode}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                      ₹{intern.raised.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(intern.progress, 100)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor:
                                intern.progress > 66
                                  ? '#4CAF50'
                                  : intern.progress > 33
                                  ? '#FFC107'
                                  : '#FF6B6B',
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ minWidth: 35, fontWeight: 'bold' }}>
                        {intern.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Campaign Performance */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Campaign Performance
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {Object.entries(analytics.campaignPerformance)
            .sort(([, a], [, b]) => b - a)
            .map(([campaign, amount]) => (
              <Box key={campaign}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{campaign || 'Direct Donation'}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                    ₹{amount.toLocaleString()}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(amount / analytics.totalAmount) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default DonationAnalytics;
