// src/components/Navigation.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ReceiptIcon from '@mui/icons-material/Receipt';

function Navigation() {
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          My App
        </Typography>
        <Box>
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            startIcon={<WhatsAppIcon />}
            sx={{ 
              backgroundColor: location.pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            WhatsApp Dashboard
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/invoice"
            startIcon={<ReceiptIcon />}
            sx={{ 
              backgroundColor: location.pathname.includes('/invoice') ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            Invoices
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation;