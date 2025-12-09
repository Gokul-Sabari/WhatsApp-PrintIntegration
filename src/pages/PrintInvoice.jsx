import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material'
import { Home, Print, Refresh } from '@mui/icons-material'
import InvoiceDisplay from '../components/InvoiceDisplay'
import { fetchInvoiceData } from '../services/api'

const PrintInvoice = () => {
  const { invoiceNo } = useParams()
  const navigate = useNavigate()
  const [invoiceData, setInvoiceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [printed, setPrinted] = useState(false)

  useEffect(() => {
    if (invoiceNo) {
      loadInvoiceData(invoiceNo)
    } else {
      setError('Invoice number is required')
      setLoading(false)
    }
  }, [invoiceNo])

  useEffect(() => {
    if (invoiceData && !printed) {
    
      setTimeout(() => {
        window.print()
        setPrinted(true)
      }, 800)
    }
  }, [invoiceData, printed])

  const loadInvoiceData = async (invNo) => {
    try {
      const data = await fetchInvoiceData(invNo)
      setInvoiceData(data)
    } catch (err) {
      setError(err.message || 'Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const handleRetry = () => {
    setPrinted(false)
    loadInvoiceData(invoiceNo)
  }

  // Handle print dialog events
  useEffect(() => {
    const handleAfterPrint = () => {
      // Redirect back after print
      setTimeout(() => {
        if (window.history.length > 1) {
          window.history.back()
        } else {
          navigate('/')
        }
      }, 1000)
    }

    window.addEventListener('afterprint', handleAfterPrint)
    
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [navigate])

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        p: 3
      }}>
        <CircularProgress size={50} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Preparing invoice for printing...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {invoiceNo}
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleGoHome}>
              Home
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
        
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={handleRetry}
            startIcon={<Refresh />}
            sx={{ mr: 2 }}
          >
            Try Again
          </Button>
          <Button
            variant="outlined"
            onClick={handleGoBack}
            startIcon={<Home />}
          >
            Go Home
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Print notice */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: 3, 
          p: 2,
          bgcolor: 'info.light',
          color: 'info.contrastText',
          borderRadius: 1,
          display: 'none'
        }}
        className="no-print"
      >
        <Typography variant="body1">
          <Print sx={{ verticalAlign: 'middle', mr: 1 }} />
          Preparing to print invoice...
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          If print dialog doesn't open automatically, press Ctrl+P
        </Typography>
      </Box>

      {/* Invoice Content */}
      <Box id="invoice-content">
        <InvoiceDisplay data={invoiceData} />
      </Box>

      {/* Print instructions */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          mt: 4, 
          p: 2,
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          display: 'none'
        }}
        className="no-print"
      >
        <Typography variant="body2" color="text.secondary">
          If printing doesn't start automatically, click the button below:
        </Typography>
        <Button
          variant="contained"
          startIcon={<Print />}
          onClick={() => window.print()}
          sx={{ mt: 2 }}
        >
          Print Now
        </Button>
      </Box>

      {/* Auto-print script */}
      <script>
        {`
          // Fallback auto-print
          setTimeout(function() {
            if (!window.matchMedia('print').matches) {
              window.print();
            }
          }, 1000);
        `}
      </script>
    </Box>
  )
}

export default PrintInvoice