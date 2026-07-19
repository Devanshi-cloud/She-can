import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Dashboard,
  People,
  AttachMoney,
  Analytics,
  Settings,
  Logout,
  Add,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import axios from 'axios';
import InternManagementTable from './InternManagementTable';
import DonationAnalytics from './DonationAnalytics';

const SuperAdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [interns, setInterns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [addInternOpen, setAddInternOpen] = useState(false);
  const [addCampaignOpen, setAddCampaignOpen] = useState(false);
  const [editingIntern, setEditingIntern] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);

  // Form states
  const [internForm, setInternForm] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    degree: '',
    graduationYear: new Date().getFullYear(),
    status: 'active',
  });

  const [campaignForm, setCampaignForm] = useState({
    title: '',
    description: '',
    targetAmount: 100000,
    endDate: new Date().toISOString().split('T')[0],
    status: 'active',
  });

  // Load data on mount
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data in parallel
      const [internRes, donationRes, campaignRes] = await Promise.all([
        axios.get('/api/multi-tenant/admin/interns', { headers }).catch(() => ({ data: { interns: [] } })),
        axios.get('/api/donations', { headers }).catch(() => ({ data: { donations: [] } })),
        axios.get('/api/campaigns', { headers }).catch(() => ({ data: { campaigns: [] } })),
      ]);

      setInterns(internRes.data.interns || []);
      setDonations(donationRes.data.donations || []);
      setCampaigns(campaignRes.data.campaigns || []);
      setError('');
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add or update intern
  const handleSaveIntern = async () => {
    if (!internForm.name || !internForm.email || !internForm.phone) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingIntern) {
        // Update existing
        await axios.put(`/api/interns/${editingIntern.id}`, internForm, { headers });
        setSuccess('Intern updated successfully');
        setEditingIntern(null);
      } else {
        // Create new
        const response = await axios.post('/api/interns', internForm, { headers });
        setSuccess('Intern added successfully');
      }

      // Reset form
      setInternForm({
        name: '',
        email: '',
        phone: '',
        college: '',
        degree: '',
        graduationYear: new Date().getFullYear(),
        status: 'active',
      });
      setAddInternOpen(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save intern');
    } finally {
      setLoading(false);
    }
  };

  // Delete intern
  const handleDeleteIntern = async (internId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`/api/interns/${internId}`, { headers });
      setSuccess('Intern deleted successfully');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete intern');
    } finally {
      setLoading(false);
    }
  };

  // Add or update campaign
  const handleSaveCampaign = async () => {
    if (!campaignForm.title || !campaignForm.targetAmount) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingCampaign) {
        // Update existing
        await axios.put(`/api/campaigns/${editingCampaign.id}`, campaignForm, { headers });
        setSuccess('Campaign updated successfully');
        setEditingCampaign(null);
      } else {
        // Create new
        await axios.post('/api/campaigns', campaignForm, { headers });
        setSuccess('Campaign created successfully');
      }

      // Reset form
      setCampaignForm({
        title: '',
        description: '',
        targetAmount: 100000,
        endDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });
      setAddCampaignOpen(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save campaign');
    } finally {
      setLoading(false);
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (campaignId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`/api/campaigns/${campaignId}`, { headers });
      setSuccess('Campaign deleted successfully');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete campaign');
    } finally {
      setLoading(false);
    }
  };

  // Edit intern
  const handleEditIntern = (intern) => {
    setInternForm({
      name: intern.name,
      email: intern.email,
      phone: intern.phone,
      college: intern.college,
      degree: intern.degree,
      graduationYear: intern.graduationYear,
      status: intern.status,
    });
    setEditingIntern(intern);
    setAddInternOpen(true);
  };

  // Edit campaign
  const handleEditCampaign = (campaign) => {
    setCampaignForm({
      title: campaign.title,
      description: campaign.description,
      targetAmount: campaign.targetAmount,
      endDate: campaign.endDate?.split('T')[0],
      status: campaign.status,
    });
    setEditingCampaign(campaign);
    setAddCampaignOpen(true);
  };

  // Calculate stats
  const stats = {
    totalInterns: interns.length,
    activeInterns: interns.filter(i => i.status === 'active').length,
    totalDonations: donations.length,
    totalRaised: donations.reduce((sum, d) => sum + (d.amount || 0), 0),
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalCampaigns: campaigns.length,
  };

  if (loading && interns.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Dashboard sx={{ color: '#9C27B0' }} />
            Super Admin Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Manage interns, campaigns, and donations
          </Typography>
        </Box>
        <Button
          startIcon={<Logout />}
          variant="outlined"
          color="error"
          onClick={onLogout}
        >
          Logout
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Active Interns
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats.activeInterns}/{stats.totalInterns}
                  </Typography>
                </Box>
                <People sx={{ fontSize: 32, color: '#2196F3', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Total Raised
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                    ₹{stats.totalRaised.toLocaleString()}
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 32, color: '#4CAF50', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Total Donations
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats.totalDonations}
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 32, color: '#FF9800', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Active Campaigns
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats.activeCampaigns}/{stats.totalCampaigns}
                  </Typography>
                </Box>
                <Analytics sx={{ fontSize: 32, color: '#9C27B0', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: '#fafafa',
          }}
        >
          <Tab icon={<People />} iconPosition="start" label="Interns" />
          <Tab icon={<Analytics />} iconPosition="start" label="Donations" />
          <Tab icon={<AttachMoney />} iconPosition="start" label="Campaigns" />
          <Tab icon={<Settings />} iconPosition="start" label="Settings" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {/* Interns Tab */}
        {activeTab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Intern Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingIntern(null);
                  setInternForm({
                    name: '',
                    email: '',
                    phone: '',
                    college: '',
                    degree: '',
                    graduationYear: new Date().getFullYear(),
                    status: 'active',
                  });
                  setAddInternOpen(true);
                }}
                sx={{ backgroundColor: '#4CAF50' }}
              >
                Add Intern
              </Button>
            </Box>
            <InternManagementTable
              interns={interns}
              onEdit={handleEditIntern}
              onDelete={handleDeleteIntern}
            />
          </Box>
        )}

        {/* Donations Tab */}
        {activeTab === 1 && (
          <DonationAnalytics donations={donations} interns={interns} />
        )}

        {/* Campaigns Tab */}
        {activeTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Campaign Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingCampaign(null);
                  setCampaignForm({
                    title: '',
                    description: '',
                    targetAmount: 100000,
                    endDate: new Date().toISOString().split('T')[0],
                    status: 'active',
                  });
                  setAddCampaignOpen(true);
                }}
                sx={{ backgroundColor: '#9C27B0' }}
              >
                Add Campaign
              </Button>
            </Box>

            {campaigns.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  No campaigns yet. Create one to get started!
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {campaigns.map((campaign) => (
                  <Grid item xs={12} md={6} key={campaign.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {campaign.title}
                            </Typography>
                            <Chip
                              label={campaign.status}
                              color={campaign.status === 'active' ? 'success' : 'warning'}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Button
                              size="small"
                              startIcon={<Edit />}
                              onClick={() => handleEditCampaign(campaign)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              startIcon={<Delete />}
                              color="error"
                              onClick={() => handleDeleteCampaign(campaign.id)}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {campaign.description}
                        </Typography>
                        <Typography variant="body2">
                          Target: <strong>₹{campaign.targetAmount.toLocaleString()}</strong>
                        </Typography>
                        <Typography variant="body2">
                          End Date: <strong>{new Date(campaign.endDate).toLocaleDateString()}</strong>
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Settings Tab */}
        {activeTab === 3 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              System Settings
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Contact support for advanced settings and configuration options.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Platform Name"
                  defaultValue="She Can Foundation"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Support Email"
                  type="email"
                  defaultValue="support@shecancampaign.org"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Intern Goal Amount"
                  type="number"
                  defaultValue="30000"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Stipend Percentage"
                  type="number"
                  defaultValue="20"
                  disabled
                  InputProps={{ endAdornment: '%' }}
                />
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      {/* Add/Edit Intern Dialog */}
      <Dialog open={addInternOpen} onClose={() => setAddInternOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
          {editingIntern ? 'Edit Intern' : 'Add New Intern'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Name"
            value={internForm.name}
            onChange={(e) => setInternForm({ ...internForm, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={internForm.email}
            onChange={(e) => setInternForm({ ...internForm, email: e.target.value })}
          />
          <TextField
            fullWidth
            label="Phone"
            value={internForm.phone}
            onChange={(e) => setInternForm({ ...internForm, phone: e.target.value })}
          />
          <TextField
            fullWidth
            label="College"
            value={internForm.college}
            onChange={(e) => setInternForm({ ...internForm, college: e.target.value })}
          />
          <TextField
            fullWidth
            label="Degree"
            value={internForm.degree}
            onChange={(e) => setInternForm({ ...internForm, degree: e.target.value })}
          />
          <TextField
            fullWidth
            label="Graduation Year"
            type="number"
            value={internForm.graduationYear}
            onChange={(e) => setInternForm({ ...internForm, graduationYear: parseInt(e.target.value) })}
          />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={internForm.status}
              label="Status"
              onChange={(e) => setInternForm({ ...internForm, status: e.target.value })}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <Box sx={{ display: 'flex', gap: 1, p: 2, justifyContent: 'flex-end' }}>
          <Button onClick={() => setAddInternOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveIntern} sx={{ backgroundColor: '#4CAF50' }}>
            {editingIntern ? 'Update' : 'Add'}
          </Button>
        </Box>
      </Dialog>

      {/* Add/Edit Campaign Dialog */}
      <Dialog open={addCampaignOpen} onClose={() => setAddCampaignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
          {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Campaign Title"
            value={campaignForm.title}
            onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={campaignForm.description}
            onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
          />
          <TextField
            fullWidth
            label="Target Amount"
            type="number"
            value={campaignForm.targetAmount}
            onChange={(e) => setCampaignForm({ ...campaignForm, targetAmount: parseInt(e.target.value) })}
          />
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={campaignForm.endDate}
            onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={campaignForm.status}
              label="Status"
              onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value })}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="paused">Paused</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <Box sx={{ display: 'flex', gap: 1, p: 2, justifyContent: 'flex-end' }}>
          <Button onClick={() => setAddCampaignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCampaign} sx={{ backgroundColor: '#9C27B0' }}>
            {editingCampaign ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Dialog>
    </Container>
  );
};

export default SuperAdminDashboard;
