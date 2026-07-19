import { useState, useEffect } from "react";
import { buildApiUrl } from '../constants.js';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Breadcrumbs,
  Link,
  Avatar,
  Popover,
  ListItemButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  BarChart as BarChartIcon,
  NavigateNext as NavigateNextIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const drawerWidth = 260;

const theme = createTheme({
  palette: {
    primary: { main: "#7C3AED" }, // Purple for super admins - authority & wisdom
    secondary: { main: "#EC4899" },
    background: { default: "#F5F3FF" },
    text: { primary: "#1F2937", secondary: "#6B7280" },
  },
  typography: { fontFamily: "'Poppins', sans-serif" },
});

const SuperAdminDashboardEnhanced = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSection, setSelectedSection] = useState("Dashboard");
  const [userDetails, setUserDetails] = useState({ name: "Admin", email: "", role: "Super Admin" });
  const [isLoading, setIsLoading] = useState(false);
  const [interns, setInterns] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [internDialogOpen, setInternDialogOpen] = useState(false);
  const [newIntern, setNewIntern] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(buildApiUrl("/api/auth/user"), {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setUserDetails({
            name: `${data.user.firstname} ${data.user.lastname}`,
            email: data.user.email,
            role: data.user.role,
          });
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (!token) return;

    const fetchDashboardData = async () => {
      setDataLoading(true);
      try {
        if (selectedSection === "Interns") {
          const response = await fetch(buildApiUrl("/api/multi-tenant/admin/interns"), {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (data.success) setInterns(data.data);
        } else if (selectedSection === "Campaigns") {
          const response = await fetch(buildApiUrl("/api/multi-tenant/admin/campaigns"), {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (data.success) setCampaigns(data.data);
        } else if (selectedSection === "Analytics") {
          const response = await fetch(buildApiUrl("/api/multi-tenant/admin/analytics"), {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (data.success) setAnalytics(data.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load data");
      } finally {
        setDataLoading(false);
      }
    };

    if (selectedSection !== "Dashboard") {
      fetchDashboardData();
    }
  }, [selectedSection, token]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const handleSectionChange = (section) => {
    setSelectedSection(section);
    if (mobileOpen) setMobileOpen(false);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon /> },
    { text: "Interns", icon: <PeopleIcon /> },
    { text: "Campaigns", icon: <CampaignIcon /> },
    { text: "Analytics", icon: <BarChartIcon /> },
  ];

  const drawerContent = (
    <Box sx={{ bgcolor: "#F5F3FF", height: "100%", borderRight: "2px solid #7C3AED" }}>
      <Box
        sx={{
          p: { xs: 1, sm: 2 },
          bgcolor: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, color: "white", letterSpacing: 1 }}>
          Admin Portal
        </Typography>
      </Box>
      <List sx={{ py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleSectionChange(item.text)}
              sx={{
                py: 1.5,
                px: 3,
                bgcolor: selectedSection === item.text ? "rgba(124,58,237,0.1)" : "transparent",
                color: selectedSection === item.text ? "primary.main" : "text.secondary",
                "&:hover": { bgcolor: "rgba(124,58,237,0.1)" },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 48 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh" }}>
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            bgcolor: "primary.main",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700 }}>
              Welcome, {userDetails.name}!
            </Typography>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <Avatar alt={userDetails.name} sx={{ bgcolor: "secondary.main" }} />
            </IconButton>
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {userDetails.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                  {userDetails.email}
                </Typography>
                <Button
                  fullWidth
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  variant="outlined"
                  color="error"
                >
                  Logout
                </Button>
              </Box>
            </Popover>
          </Toolbar>
        </AppBar>

        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: drawerWidth } }}
          >
            {drawerContent}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": { width: drawerWidth },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: 10,
          }}
        >
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
            <Link color="text.secondary" sx={{ cursor: "pointer" }} onClick={() => handleSectionChange("Dashboard")}>
              / Admin
            </Link>
            <Typography color="primary.main" sx={{ fontWeight: 600 }}>
              {selectedSection}
            </Typography>
          </Breadcrumbs>

          {selectedSection === "Dashboard" && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, textAlign: "center" }}>
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700, mb: 1 }}>
                      Total Interns
                    </Typography>
                    <Typography variant="h3" sx={{ color: "primary.main", fontWeight: 800 }}>
                      {interns.length || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, textAlign: "center" }}>
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700, mb: 1 }}>
                      Total Campaigns
                    </Typography>
                    <Typography variant="h3" sx={{ color: "primary.main", fontWeight: 800 }}>
                      {campaigns.length || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, textAlign: "center" }}>
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700, mb: 1 }}>
                      Total Donations
                    </Typography>
                    <Typography variant="h3" sx={{ color: "primary.main", fontWeight: 800 }}>
                      ₹{analytics?.overview?.totalDonations?.toLocaleString() || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ p: 3, textAlign: "center" }}>
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700, mb: 1 }}>
                      Avg Donation
                    </Typography>
                    <Typography variant="h3" sx={{ color: "primary.main", fontWeight: 800 }}>
                      ₹{Math.round(analytics?.overview?.averageDonation || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {selectedSection === "Interns" && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Manage Interns
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setInternDialogOpen(true)}
                >
                  Add Intern
                </Button>
              </Box>

              {dataLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ bgcolor: "primary.main" }}>
                      <TableRow>
                        <TableCell sx={{ color: "white", fontWeight: 700 }}>Name</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 700 }}>Email</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 700 }}>Total Raised</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 700 }}>Referrals</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 700 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {interns.map((intern, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>{`${intern.first_name} ${intern.last_name}`}</TableCell>
                          <TableCell>{intern.email}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>₹{(intern.totalRaised || 0).toLocaleString()}</TableCell>
                          <TableCell>{intern.referralCount || 0}</TableCell>
                          <TableCell>
                            <IconButton size="small" color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {selectedSection === "Campaigns" && (
            <Grid container spacing={2}>
              {dataLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4, width: "100%" }}>
                  <CircularProgress />
                </Box>
              ) : campaigns.length > 0 ? (
                campaigns.map((campaign, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          {campaign.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                          {campaign.description?.substring(0, 100)}...
                        </Typography>
                        <Chip label={campaign.status || "Active"} color="primary" variant="outlined" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Alert severity="info" sx={{ width: "100%" }}>
                  No campaigns found
                </Alert>
              )}
            </Grid>
          )}

          <ToastContainer position="top-right" autoClose={3000} />
        </Box>
      </Box>

      {/* Add Intern Dialog */}
      <Dialog open={internDialogOpen} onClose={() => setInternDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Intern</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="First Name"
            value={newIntern.firstName}
            onChange={(e) => setNewIntern({ ...newIntern, firstName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Last Name"
            value={newIntern.lastName}
            onChange={(e) => setNewIntern({ ...newIntern, lastName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newIntern.email}
            onChange={(e) => setNewIntern({ ...newIntern, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={newIntern.password}
            onChange={(e) => setNewIntern({ ...newIntern, password: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInternDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary">
            Add Intern
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default SuperAdminDashboardEnhanced;
