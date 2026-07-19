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
  Divider,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Share as ShareIcon,
  Assessment as AssessmentIcon,
  NavigateNext as NavigateNextIcon,
  Logout as LogoutIcon,
  CopyAll as CopyAllIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const drawerWidth = 260;

const theme = createTheme({
  palette: {
    primary: { main: "#10B981" }, // Green for interns - growth & renewal
    secondary: { main: "#06B6D4" },
    background: { default: "#F0FDF4" },
    text: { primary: "#1F2937", secondary: "#6B7280" },
  },
  typography: { fontFamily: "'Poppins', sans-serif" },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
});

const InternDashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSection, setSelectedSection] = useState("Dashboard");
  const [userDetails, setUserDetails] = useState({ 
    name: "Intern", 
    email: "", 
    role: "Intern",
    referralCode: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalRaised: 0,
    totalReferrals: 0,
    stipendAmount: 0,
    goalAmount: 30000,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!isLoggedIn) return;
      setIsLoading(true);
      try {
        const response = await fetch(buildApiUrl("/api/auth/user"), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUserDetails({
            name: `${data.user.firstname} ${data.user.lastname}`,
            email: data.user.email,
            role: data.user.role,
            referralCode: data.user.referralCode,
          });
          setShareUrl(`${window.location.origin}/donate?ref=${data.user.referralCode}`);
        } else {
          console.error("Failed to fetch user details:", data.msg);
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
    const fetchDashboardStats = async () => {
      setStatsLoading(true);
      try {
        const donationsRes = await fetch(buildApiUrl("/api/donations"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const donationsData = await donationsRes.json();
        
        if (donationsData.donations) {
          const totalRaised = donationsData.donations.reduce((sum, d) => sum + (d.amount || 0), 0);
          const stipend = totalRaised * 0.20;
          
          setDashboardStats({
            totalRaised,
            totalReferrals: donationsData.donations.length,
            stipendAmount: stipend,
            goalAmount: 30000,
          });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };
    
    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setAnchorEl(null);
  };
  const handleSectionChange = (section) => {
    setSelectedSection(section);
    if (mobileOpen) setMobileOpen(false);
  };
  const handleLogoClick = () => navigate("/");

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(userDetails.referralCode);
    toast.success("Referral code copied to clipboard!", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon /> },
    { text: "My Performance", icon: <TrendingUpIcon /> },
    { text: "Referrals", icon: <ShareIcon /> },
    { text: "Earnings", icon: <AssessmentIcon /> },
  ];

  const drawerContent = (
    <Box sx={{ bgcolor: "#F0FDF4", height: "100%", borderRight: "2px solid #10B981" }}>
      <Box
        sx={{
          p: { xs: 1, sm: 2 },
          bgcolor: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0px 2px 10px rgba(0,0,0,0.2)",
        }}
        onClick={handleLogoClick}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: "white",
            letterSpacing: 1,
            fontSize: { xs: "1.5rem", sm: "1.8rem" },
          }}
        >
          NayePankh
        </Typography>
      </Box>
      <List sx={{ py: { xs: 1, sm: 2 } }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleSectionChange(item.text)}
              sx={{
                py: { xs: 1.2, sm: 1.5 },
                px: { xs: 2, sm: 3 },
                bgcolor: selectedSection === item.text ? "rgba(16,185,129,0.1)" : "transparent",
                color: selectedSection === item.text ? "primary.main" : "text.secondary",
                "&:hover": { bgcolor: "rgba(16,185,129,0.1)", color: "primary.main" },
                transition: "all 0.3s ease",
                borderRadius: 1,
                mx: 1,
              }}
            >
              <ListItemIcon
                sx={{
                  color: selectedSection === item.text ? "primary.main" : "text.secondary",
                  minWidth: { xs: 40, sm: 48 },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  "& .MuiTypography-root": {
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    fontWeight: selectedSection === item.text ? 600 : 400,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const progressPercentage = (dashboardStats.totalRaised / dashboardStats.goalAmount) * 100;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh" }}>
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            bgcolor: "primary.main",
            boxShadow: "0px 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          <Toolbar sx={{ py: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: { xs: 1, sm: 2 }, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              sx={{ flexGrow: 1, color: "white", fontWeight: 700, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
            >
              Welcome, {userDetails.name}!
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ p: { xs: 0.5, sm: 1 } }}
            >
              <Avatar
                alt={userDetails.name}
                sx={{
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                  border: "2px solid white",
                  boxShadow: "0px 0px 12px rgba(255, 255, 255, 0.5)",
                  bgcolor: "secondary.main",
                }}
              />
            </IconButton>
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "primary.main" }}>
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
                  sx={{ py: 1, fontSize: "0.9rem" }}
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
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
            }}
          >
            {drawerContent}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
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
            p: { xs: 2, sm: 4 },
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: { xs: 8, sm: 10 },
            bgcolor: "background.default",
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" sx={{ color: "text.secondary" }} />}
              sx={{ bgcolor: "white", p: { xs: 1.5, sm: 2 }, borderRadius: 2, boxShadow: "0px 2px 10px rgba(0,0,0,0.05)" }}
            >
              <Link
                underline="hover"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.9rem", sm: "1rem" }, cursor: "pointer" }}
                onClick={() => handleSectionChange("Dashboard")}
              >
                / Intern
              </Link>
              <Typography
                color="primary.main"
                sx={{ fontSize: { xs: "0.9rem", sm: "1rem" }, fontWeight: 600 }}
              >
                {selectedSection}
              </Typography>
            </Breadcrumbs>
          </Box>

          {selectedSection === "Dashboard" && (
            <Box>
              <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 4, sm: 6 } }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
                      bgcolor: "white",
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 160,
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-5px)', boxShadow: '0px 8px 25px rgba(16,185,129,0.15)' },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", p: 0 }}>
                      <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700, mb: 1 }}>
                        Total Raised
                      </Typography>
                      {statsLoading ? (
                        <CircularProgress color="primary" size={32} />
                      ) : (
                        <Typography variant="h3" sx={{ color: "primary.main", fontWeight: 800 }}>
                          ₹{dashboardStats.totalRaised?.toLocaleString()}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
                      bgcolor: "white",
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 160,
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-5px)', boxShadow: '0px 8px 25px rgba(16,185,129,0.15)' },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", p: 0 }}>
                      <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700, mb: 1 }}>
                        Your Stipend
                      </Typography>
                      {statsLoading ? (
                        <CircularProgress color="primary" size={32} />
                      ) : (
                        <Typography variant="h3" sx={{ color: "primary.main", fontWeight: 800 }}>
                          ₹{dashboardStats.stipendAmount?.toLocaleString()}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
                      bgcolor: "white",
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 160,
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-5px)', boxShadow: '0px 8px 25px rgba(16,185,129,0.15)' },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", p: 0 }}>
                      <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700, mb: 1 }}>
                        Goal Progress
                      </Typography>
                      {statsLoading ? (
                        <CircularProgress color="primary" size={32} />
                      ) : (
                        <Typography variant="h3" sx={{ color: "primary.main", fontWeight: 800 }}>
                          {Math.min(100, Math.round(progressPercentage))}%
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
                      bgcolor: "white",
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 160,
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-5px)', boxShadow: '0px 8px 25px rgba(16,185,129,0.15)' },
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", p: 0 }}>
                      <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700, mb: 1 }}>
                        Total Referrals
                      </Typography>
                      {statsLoading ? (
                        <CircularProgress color="primary" size={32} />
                      ) : (
                        <Typography variant="h3" sx={{ color: "primary.main", fontWeight: 800 }}>
                          {dashboardStats.totalReferrals}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Referral Code Section */}
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: "0px 6px 20px rgba(0,0,0,0.1)", mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700, mb: 3 }}>
                    Your Referral Code
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                    <Chip
                      label={userDetails.referralCode}
                      variant="outlined"
                      color="primary"
                      sx={{
                        fontSize: "1rem",
                        py: 3,
                        px: 2,
                        fontWeight: 700,
                        letterSpacing: 1,
                      }}
                      onClick={handleCopyReferral}
                      icon={<CopyAllIcon />}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<CopyAllIcon />}
                      onClick={handleCopyReferral}
                    >
                      Copy Code
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Share Link Section */}
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: "0px 6px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700, mb: 3 }}>
                    Share Your Link
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <TextField
                      fullWidth
                      value={shareUrl}
                      readOnly
                      variant="outlined"
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontFamily: "monospace",
                          fontSize: "0.9rem",
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<CopyAllIcon />}
                      onClick={handleCopyShareUrl}
                    >
                      Copy Link
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          <ToastContainer position="top-right" autoClose={3000} />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default InternDashboard;
