import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  Box,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  TrendingUp,
  Phone,
  Email,
} from '@mui/icons-material';

const InternManagementTable = ({ interns = [], onEdit, onDelete, onView }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filter and search
  const filteredInterns = useMemo(() => {
    let result = interns;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (intern) =>
          intern.name?.toLowerCase().includes(term) ||
          intern.email?.toLowerCase().includes(term) ||
          intern.referralCode?.toLowerCase().includes(term) ||
          intern.college?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter((intern) => intern.status === filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'raised':
          return (b.totalRaised || 0) - (a.totalRaised || 0);
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'goal':
          return ((b.totalRaised || 0) / 30000) - ((a.totalRaised || 0) / 30000);
        default:
          return 0;
      }
    });

    return result;
  }, [interns, searchTerm, filterStatus, sortBy]);

  const paginatedInterns = useMemo(() => {
    return filteredInterns.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredInterns, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (intern) => {
    setSelectedIntern(intern);
    setDetailsOpen(true);
    if (onView) onView(intern);
  };

  const handleEdit = (intern) => {
    if (onEdit) onEdit(intern);
  };

  const handleDeleteClick = (intern) => {
    setDeleteTarget(intern);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete && deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      active: { color: 'success', label: 'Active' },
      inactive: { color: 'warning', label: 'Inactive' },
      suspended: { color: 'error', label: 'Suspended' },
      onboarding: { color: 'info', label: 'Onboarding' },
    };
    const config = statusConfig[status] || statusConfig.active;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getGoalProgress = (raised) => {
    const progress = ((raised || 0) / 30000) * 100;
    return Math.min(progress, 100);
  };

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search interns..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          size="small"
          sx={{ flex: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
            <MenuItem value="onboarding">Onboarding</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="name">Name (A-Z)</MenuItem>
            <MenuItem value="raised">Amount Raised</MenuItem>
            <MenuItem value="goal">Goal Progress</MenuItem>
            <MenuItem value="recent">Recently Added</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Referral Code</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                Raised
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Goal Progress</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedInterns.map((intern) => {
              const progress = getGoalProgress(intern.totalRaised);
              return (
                <TableRow key={intern.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {intern.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {intern.college}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email sx={{ fontSize: 16, color: 'textSecondary' }} />
                      <Typography variant="body2">{intern.email}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        backgroundColor: '#f0f0f0',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {intern.referralCode}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        ₹{(intern.totalRaised || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Stipend: ₹{Math.round((intern.totalRaised || 0) * 0.2).toLocaleString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            flex: 1,
                            height: 8,
                            backgroundColor: '#e0e0e0',
                            borderRadius: 4,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${progress}%`,
                              backgroundColor:
                                progress > 66
                                  ? '#4CAF50'
                                  : progress > 33
                                  ? '#FFC107'
                                  : '#FF6B6B',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ minWidth: 35 }}>
                          {Math.round(progress)}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        Goal: ₹30,000
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusChip(intern.status)}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(intern)}
                        title="View Details"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(intern)}
                        title="Edit"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(intern)}
                        title="Delete"
                        sx={{ color: 'error.main' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredInterns.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
          Intern Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedIntern && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Name
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {selectedIntern.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body2">{selectedIntern.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Phone
                </Typography>
                <Typography variant="body2">{selectedIntern.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  College
                </Typography>
                <Typography variant="body2">
                  {selectedIntern.college} - {selectedIntern.degree}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Referral Code
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                >
                  {selectedIntern.referralCode}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Total Raised
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                  ₹{(selectedIntern.totalRaised || 0).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Stipend Earned (20%)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                  ₹{Math.round((selectedIntern.totalRaised || 0) * 0.2).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InternManagementTable;
