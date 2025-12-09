import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PrintInvoiceModal from '../components/PrintInvoiceModal';
import { invoiceApi, companyApi } from '../services/api';

const InvoiceView = () => {
  const { invoiceNo } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userInfo] = useState({ UserName: 'Admin' });


  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        setLoading(true);
        
         console.log("invoiceNo",invoiceNo)
        const response = await invoiceApi.getInvoiceByNumber(invoiceNo || '');
        setInvoiceData(response.data);
        
        // Fetch company info
        const companyResponse = await companyApi.getCompanyInfo();
        setCompanyInfo(companyResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Failed to load invoice data. Please check the invoice number.');
        setLoading(false);
      }
    };

    if (invoiceNo) {
      fetchInvoiceData();
    } else {
      setError('No invoice number provided');
      setLoading(false);
    }
  }, [invoiceNo]);

  // Prepare data for print modal
  const preparePrintData = () => {
    if (!invoiceData || !companyInfo) return null;

    // Extract data in the format expected by PrintInvoiceModal
    return {
      customer: invoiceData.customer || invoiceData.Customer_Info || {},
      cartItems: invoiceData.products || invoiceData.Products_List || invoiceData.cartItems || [],
      totals: invoiceData.totals || invoiceData.Invoice_Info || {},
      storage: userInfo,
      company: companyInfo
    };
  };

  // Handle print and save
  const handlePrintAndSave = async () => {
    try {
      // If you need to save before printing, do it here
      // For example, mark invoice as printed
      if (invoiceData?._id) {
        await invoiceApi.printInvoice(invoiceData._id);
      }
      
      toast.success('Invoice ready for printing');
      return true;
    } catch (err) {
      console.error('Error saving invoice:', err);
      toast.error('Failed to save invoice status');
      return false;
    }
  };

  // Handle reprint
  const handleReprint = () => {
    if (invoiceData?._id) {
      invoiceApi.printInvoice(invoiceData._id)
        .then(() => toast.success('Reprint logged'))
        .catch(err => console.error('Reprint log error:', err));
    }
  };

  if (loading) {
    return (
      <Container sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Loading Invoice #{invoiceNo}...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.href = '/'}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  const printData = preparePrintData();
  if (!printData) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">
          No invoice data available
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Invoice Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, pb: 3, borderBottom: '2px solid #eee' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
              INVOICE
            </Typography>
            <Typography variant="h6" color="text.secondary">
              #{invoiceNo}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="body1">
              Date: {new Date().toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status: Ready for Print
            </Typography>
          </Box>
        </Box>

        {/* Customer & Company Info */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bill To
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {printData.customer.Billl_Name || printData.customer.Name}
                </Typography>
                <Typography variant="body2">
                  {printData.customer.Address}
                </Typography>
                <Typography variant="body2">
                  {printData.customer.City}, {printData.customer.State} - {printData.customer.Pincode}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>GSTIN:</strong> {printData.customer.GSTIN || 'Not Available'}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {printData.customer.Phone || printData.customer.Mobile_No}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  From
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {printData.company.Name}
                </Typography>
                <Typography variant="body2">
                  {printData.company.Address}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>GSTIN:</strong> {printData.company.GSTIN}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {printData.company.Phone}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Invoice Summary */}
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Invoice Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Items:</Typography>
                  <Typography fontWeight="bold">
                    {printData.cartItems.length} products
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>₹{printData.totals.subtotal?.toFixed(2) || '0.00'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax:</Typography>
                  <Typography>₹{printData.totals.taxAmount?.toFixed(2) || '0.00'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: 'primary.light', 
                  borderRadius: 1,
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" color="white">
                    Total Amount
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="white">
                    ₹{printData.totals.grandTotal?.toFixed(2) || printData.totals.subtotal?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Print Actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 3, 
          mt: 4,
          pt: 3,
          borderTop: '1px solid #eee'
        }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => setModalOpen(true)}
            sx={{ minWidth: 200, py: 1.5 }}
          >
            Print Invoice
          </Button>
          
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            onClick={() => {
              handleReprint();
              setModalOpen(true);
            }}
            sx={{ minWidth: 200, py: 1.5 }}
          >
            Reprint Invoice
          </Button>
        </Box>

        {/* Print Modal */}
        <PrintInvoiceModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          customer={printData.customer}
          cartItems={printData.cartItems}
          totals={printData.totals}
          storage={printData.storage}
          company={printData.company}
          isReprint={false}
          onPrintAndSave={handlePrintAndSave}
        />
      </Paper>
    </Container>
  );
};

export default InvoiceView;