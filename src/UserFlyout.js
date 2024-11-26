import React from "react";
import { Popper, Paper, IconButton, Typography, Grid, Avatar, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QRCode from 'react-qr-code'; // Use a QR code library for generating the QR code

function UserFlyout({ anchorEl, open, onClose, user }) {
  const playerStats = {
    gamesPlayed: 25,
    highestScore: 1200,
    wins: 15,
    losses: 10,
    currentScore: 500,
  };

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end" style={{ zIndex: 1300 }}>
      <Paper
        elevation={4}
        sx={{
          width: 300,
          borderRadius: 3,
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Close Button */}
        <IconButton
          sx={{ alignSelf: 'flex-start', marginBottom: 1 }}
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>

        {/* Profile Section */}
        <Avatar
          alt={user?.name || "Player"}
          src={user?.photoURL || "https://via.placeholder.com/150"}
          sx={{ width: 80, height: 80, marginBottom: 1 }}
        />
        <Typography variant="h6">{user?.id || "A-56"}</Typography>
        <Typography variant="body2" color="textSecondary">
          Player ID
        </Typography>
        <Box sx={{ marginTop: 2, marginBottom: 2 }}>
          <QRCode value={user?.id || "A-56"} size={80} />
        </Box>

        {/* Stats Section */}
        <Box
          sx={{
            width: '100%',
            backgroundColor: '#f9f9f9',
            borderRadius: 2,
            padding: 2,
          }}
        >
          <Typography variant="body1" gutterBottom>
            Personal Stats
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body2">Games Played:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" align="right">
                {playerStats.gamesPlayed}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">Highest Score:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" align="right">
                {playerStats.highestScore}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">Wins:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" align="right">
                {playerStats.wins}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">Losses:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" align="right">
                {playerStats.losses}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">Current Score:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" align="right">
                {playerStats.currentScore}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Popper>
  );
}

export default UserFlyout;
