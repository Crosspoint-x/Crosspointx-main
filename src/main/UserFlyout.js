import React, { useEffect, useState } from "react";
import {
  Popper,
  Paper,
  IconButton,
  Typography,
  Grid,
  Avatar,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import QRCode from "react-qr-code";
import { FIREBASE_STORAGE, FIREBASE_STORE } from "../firebase"; // Make sure to import firebase services
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";

function UserFlyout({ anchorEl, open, onClose, user, onUpdatePfp }) {
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(false);

  // Fetch player stats from Firestore
  useEffect(() => {
    if (user?.id) {
      const fetchPlayerStats = async () => {
        setLoading(true);
        try {
          const playerRef = doc(FIREBASE_STORE, "players", user.id); // Adjust the collection and document path as needed
          const playerSnap = await getDoc(playerRef);
          setPlayerStats(playerSnap.data());
        } catch (err) {
          setError("Failed to load player stats.");
        } finally {
          setLoading(false);
        }
      };

      fetchPlayerStats();
    }
  }, [user?.id]);

  // Handle avatar click and file input
  const handleAvatarClick = () => {
    document.getElementById("avatar-input").click();
  };

  // Handle avatar file change
  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // 1. Upload to Firebase Storage
        const storageRef = ref(
          FIREBASE_STORAGE,
          `avatars/${user.id}/${file.name}`,
        );
        const uploadTask = uploadBytesResumable(storageRef, file);

        // 2. Track upload progress (optional)
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Monitor the progress (if needed)
          },
          (err) => {
            console.error("Upload failed", err);
          },
          async () => {
            // 3. Get the download URL after upload completes
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // 4. Update Firestore with the new photo URL
            const userRef = doc(FIREBASE_STORE, "users", user.id); // Adjust collection name as needed
            await updateDoc(userRef, {
              photoURL: downloadURL,
            });

            // 5. Update local state and notify parent
            onUpdatePfp(downloadURL);
          },
        );
      } catch (err) {
        console.error("Failed to upload avatar:", err);
      }
    }
  };

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      style={{ zIndex: 1300 }}
    >
      <Paper
        elevation={4}
        sx={{
          width: 300,
          borderRadius: 3,
          padding: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Close Button */}
        <IconButton
          sx={{ alignSelf: "flex-end", marginBottom: 1 }}
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>

        {/* Profile Section */}
        <Box
          sx={{
            position: "relative",
            cursor: "pointer",
            width: 80,
            height: 80,
            marginBottom: 1,
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={handleAvatarClick}
        >
          <Avatar
            alt={user?.name || "Player"}
            src={user?.photoURL || "https://via.placeholder.com/150"}
            sx={{ width: 80, height: 80 }}
          />
          {hovered && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "50%",
              }}
            >
              <CameraAltIcon sx={{ color: "white" }} />
            </Box>
          )}
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>
          {user?.name || "Player"}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ marginBottom: 2 }}
        >
          Player ID: {user?.id || "A-56"}
        </Typography>

        <Divider sx={{ width: "100%", marginY: 2 }} />

        {/* QR Code Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: 2,
            marginBottom: 2,
          }}
        >
          <QRCode value={user?.id || "A-56"} size={80} />
        </Box>

        {/* Stats Section */}
        {loading ? (
          <CircularProgress sx={{ marginY: 2 }} />
        ) : error ? (
          <Typography color="error" sx={{ marginY: 2 }}>
            {error}
          </Typography>
        ) : (
          <Box
            sx={{
              width: "100%",
              padding: 2,
              backgroundColor: "#f9f9f9",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", marginBottom: 1 }}
            >
              Personal Stats
            </Typography>
            <Grid container spacing={1}>
              {playerStats &&
                Object.entries(playerStats).map(([key, value]) => (
                  <Grid container item xs={12} key={key}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                        :
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">
                        {value}
                      </Typography>
                    </Grid>
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Popper>
  );
}

export default UserFlyout;
