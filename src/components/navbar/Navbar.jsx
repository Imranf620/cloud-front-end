import React, { useContext, useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import { Brightness4, Brightness7, CloudUpload } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { toast } from "react-toastify";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyProfile, logout } from "../../features/userSlice";
import { uploadFile } from "../../features/filesSlice";
import { reFetchContext } from "../../context/ReFetchContext";
import axios from "axios";  // Ensure axios is imported

const Navbar = ({ toggleDarkMode, isDarkMode, handleToggle }) => {
  const { loading, user } = useSelector((state) => state.auth);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const { handleRefetch } = useContext(reFetchContext);
  const navigate = useNavigate();
  const baseApi = import.meta.env.VITE_API_URL;
  console.log("user", user)


  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      const result = await dispatch(logout());
      if (result.payload.success === true) {
        navigate("/login");
      }
      toast.success(result.payload.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setOpenDialog(true);
    console.log("file", file)
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) {
      toast.error("No file selected!");
      return;
    }
    
    setUploadProgress(0); // Reset progress
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Step 1: Get presigned URL from backend
      const response = await axios.post(`${baseApi}/pre-ass-url`, {
        fileName: selectedFile.name,
        fileType: selectedFile.type,
      }, { withCredentials: true });

      const { url, downloadUrl } = response.data;

      // Step 2: Upload the file to S3
      const uploadResponse = await axios.put(url, selectedFile, {
        headers: {
          'Content-Type': selectedFile.type,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent); // Update progress
        },
      });

      // Step 3: Append download URL and proceed with file save in backend
      formData.append("downloadUrl", downloadUrl);

      // Step 4: Upload file info to backend
      const result = await dispatch(uploadFile({name:selectedFile.name, size:selectedFile.size, type:selectedFile.type, path:downloadUrl}));
      console.log("result", result);

      if (result.payload?.success) {
        toast.success(result.payload.message);
        handleRefetch();
        dispatch(fetchMyProfile());
      } else {
        toast.error(result.payload.message);
      }

    } catch (error) {
      toast.error("Error uploading file: " + error.message);
    } finally {
      setUploadProgress(0); // Reset progress after the upload attempt
      setOpenDialog(false);  // Close the dialog after the upload is complete
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setOpenDialog(false);
  };

  // Close the menu when the user navigates to a new route
  useEffect(() => {
    setMenuOpen(false); // Close menu on route change
  }, [location]);

  return (
    <AppBar position="sticky" color="secondary">
      <Toolbar className="flex justify-between items-center">
        <Typography variant="h6">Storify</Typography>

        <div className="flex items-center gap-4">
          <Tooltip title="Upload File">
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CloudUpload />}
              component="label"
             
            >
              Upload
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
          </Tooltip>

          {/* Loader/Progress Bar */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <CircularProgress size={20} />
              {uploadProgress > 0 && (
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  style={{ width: "100px" }}
                />
              )}
            </div>
          )}

          <Tooltip title="User Profile">
            <IconButton onClick={handleMenuClick} color="inherit">
              <Avatar alt="User" src={user?.user?.image}/>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            PaperProps={{
              style: { backgroundColor: isDarkMode ? "#424242" : "#9C27B0", color: "#ffffff" },
            }}
          >
            <Link to="/profile">
              <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            </Link>
            <Link to="/packages">
              <MenuItem onClick={handleMenuClose}>Subscriptions</MenuItem>
            </Link>
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>

          <Tooltip title={isDarkMode ? "Light Mode" : "Dark Mode"}>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <div className="md:hidden">
              <MenuIcon onClick={handleToggle} />
            </div>
          </Tooltip>
        </div>
      </Toolbar>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCancelUpload}>
        <DialogTitle>Confirm File Upload</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to upload the file{" "}
            <strong>{selectedFile?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUpload} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmUpload} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar;