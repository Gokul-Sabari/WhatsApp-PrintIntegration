import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, Paper, Typography, Button, Box, CircularProgress,
  Alert, Grid, Card, CardContent, Dialog, DialogContent, DialogTitle, DialogActions
} from '@mui/material';
import { Close, Download, Print } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import { invoiceApi, companyApi } from '../services/api';
import { useParams, useLocation } from 'react-router-dom';
import { 
  isEqualNumber, 
  isGraterNumber, 
  NumberFormat, 
  Addition, 
  RoundNumber 
} from '../components/functions';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const taxCalc = (method = 1, amount = 0, percentage = 0) => {
  switch (method) {
    case 0:
      return RoundNumber(amount * (percentage / 100));
    case 1:
      return RoundNumber(amount - (amount * (100 / (100 + percentage))));
    case 2:
      return 0;
    default:
      return 0;
  }
}

const PrintableContent = React.forwardRef(({ printData, invoiceData, includedProducts, calculateTotalBags, IS_IGST }, ref) => {
  if (!printData) return null;
  
  return (
    <div style={{ display: 'none' }}>
      <div ref={ref} style={{ 

        fontFamily: "Courier New, monospace",
        fontSize: "13px",
        padding: "3mm", 
        lineHeight: 1.4,
        color: "#000",
        fontWeight: "bold",

        backgroundColor: "white"
      }}>
    
        <div style={{ 
          textAlign: "center", 
          fontWeight: "950", 
          borderBottom: "3px solid #000",
          marginBottom: "4mm", 
          fontSize: "18px", 
          paddingBottom: "3mm",
          textTransform: "uppercase",
          letterSpacing: "1px"
        }}>
          INVOICE
        </div>
        
      </div>
    </div>
  );
});

PrintableContent.displayName = 'PrintableContent';
const InvoiceView = () => {
  const location = useLocation();
  const params = useParams();
  
  const getInvoiceNumber = () => {
    if (params.invoiceNo) {
      return params.invoiceNo;
    }
    
    const query = new URLSearchParams(location.search);
    const invoiceNumberFromQuery = query.get('invoiceNumber');
    
    return invoiceNumberFromQuery;
  };

  const invoiceNo = getInvoiceNumber();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [companyInfo, setCompanyInfo] = useState({});
  const [retailerInfo, setRetailerInfo] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isReprint, setIsReprint] = useState(false);
  const [userInfo] = useState({ UserName: 'Admin' });
  const [hasAutoDownloaded, setHasAutoDownloaded] = useState(false);
  
  const printRef = useRef();

 
  const generatePDF = async (isAutoDownload = false) => {
    try {
      setIsPrinting(true);
      const element = printRef.current;
      
      if (!element) {
        toast.error("Print content not available");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 297] 
      });

      const imgWidth = 100;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const fileName = `Invoice_${atob(invoiceNo)}_${new Date().getTime()}.pdf`;
      
      pdf.save(fileName);
      
      // Save invoice status only for non-auto downloads
      if (invoiceData?._id && !isReprint && !isAutoDownload) {
        try {
          await invoiceApi.printInvoice(invoiceData._id);
        } catch (err) {
          console.error("Failed to save invoice status:", err);
        }
      }
      
      if (isAutoDownload) {
        toast.success("PDF auto-downloaded successfully");
        setHasAutoDownloaded(true);
      } else {
        toast.success("PDF downloaded successfully");
      }
      
      setIsPrinting(false);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
      setIsPrinting(false);
    }
  };

const handleReactPrint = useReactToPrint({
  content: () => printRef.current,
  documentTitle: `Invoice_${atob(invoiceNo)}`,
  onBeforeGetContent: () => {
    setIsPrinting(true);
    return new Promise((resolve) => {

      setTimeout(() => {
        resolve();
      }, 200);
    });
  },
  onAfterPrint: () => {
    setIsPrinting(false);
    toast.success("Print completed successfully");
  },
  onPrintError: (err) => {
    setIsPrinting(false);
    console.error("Print Error:", err);
    toast.error("Print failed");
  },
  pageStyle: `
    @page {
      size: 80mm 297mm;
      margin: 0;
      padding: 0;
    }
    @media print {
      body {
        width: 100mm;
        margin: 0;
        padding: 0;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `,
  removeAfterPrint: false,
});

  const handlePrintAndSave = async () => {
    try {
      if (invoiceData?._id) {
        await invoiceApi.printInvoice(invoiceData._id);
      }
      toast.success("Invoice saved for printing");
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Failed to save invoice status");
      return false;
    }
  };


  const handleActualPrint = async () => {
    setIsPrinting(true);
    try {
      const result = await handlePrintAndSave();
      if (result) {
        
        setTimeout(() => {
          handleReactPrint();
        }, 100);
      }
    } catch (error) {
      console.error('Error in print operation:', error);
      toast.error('Error printing invoice');
      setIsPrinting(false);
    }
  };


  const handleReprintPrint = async () => {
    setIsPrinting(true);
    try {
      
      setTimeout(() => {
        handleReactPrint();
      }, 100);
    } catch (error) {
      console.error('Error in reprint operation:', error);
      toast.error('Error reprinting invoice');
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    // if (!invoiceNo) {
    //   setError("No invoice number provided");
    //   setLoading(false);
    //   return;
    // }

    const fetchInvoiceData = async () => {
      try {
        setLoading(true);
        setError(null);

        const decrypted = atob(invoiceNo);
        const response = await invoiceApi.getInvoiceByNumber(decrypted);
        const invoice = response.data.data?.[0] || response.data;
        setInvoiceData(invoice);

        const companyResponse = await companyApi.getCompanyInfo();
        setCompanyInfo(companyResponse.data?.data?.[0] || companyResponse.data || {});

        if (invoice.Retailer_Id) {
          try {
            const retailerResponse = await invoiceApi.getRetailerInfo(invoice.Retailer_Id);
            setRetailerInfo(retailerResponse.data?.data?.[0] || retailerResponse.data || {});
          } catch (err) {
            console.warn("Could not fetch retailer info:", err);
          }
        }

        setLoading(false);
        setModalOpen(true);
        
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError("Failed to load invoice data. Please check the invoice number.");
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [invoiceNo]);


  // useEffect(() => {
  //   if (invoiceData && companyInfo && !hasAutoDownloaded && !loading) {
  //     const timer = setTimeout(() => {
  //       generatePDF(true);
  //     }, 1000);
      
  //     return () => clearTimeout(timer);
  //   }
  // }, [invoiceData, companyInfo, hasAutoDownloaded, loading]);

  const preparePrintData = () => {
    if (!invoiceData || !companyInfo) return null;
    
    return {
      ...invoiceData,
      customer: {
        name: invoiceData.Retailer_Name,
        id: invoiceData.Retailer_Id,
        address: retailerInfo?.Reatailer_Address || invoiceData.Party_Location,
        city: retailerInfo?.Reatailer_City || invoiceData.Party_Mailing_Name,
        pincode: retailerInfo?.PinCode,
        gst: retailerInfo?.Gstno || invoiceData.GST_No,
        state: retailerInfo?.StateGet,
        mobile: retailerInfo?.Mobile_No || invoiceData.Party_Mobile_1
      },
      company: {
        name: companyInfo.Company_Name || companyInfo.Name,
        address: companyInfo.Company_Address || companyInfo.Address,
        city: companyInfo.Region,
        pincode: companyInfo.Pincode,
        gst: companyInfo.Gst_Number || companyInfo.GSTIN,
        state: companyInfo.State,
        phone: companyInfo.Phone
      },
      totals: {
        totalBeforeTax: invoiceData.Total_Before_Tax,
        totalInvoiceValue: invoiceData.Total_Invoice_value,
        cgst: invoiceData.CSGT_Total,
        sgst: invoiceData.SGST_Total,
        igst: invoiceData.IGST_Total,
        roundOff: invoiceData.Round_off
      },
      storage: userInfo,
      invoiceNo: invoiceData.So_Inv_No || invoiceNo,
      date: invoiceData.So_Date ? new Date(invoiceData.So_Date).toLocaleDateString() : new Date().toLocaleDateString(),
      Products_List: invoiceData.Products_List || []
    };
  };


  const calculateBags = (productName, totalQtyInKG) => {
    if (!productName || !totalQtyInKG) return totalQtyInKG;
    
    const matches = productName.match(/(\d+)\s*KG/i);
    if (matches && matches[1]) {
      const bagWeightKG = parseInt(matches[1]);
      if (bagWeightKG > 0 && totalQtyInKG > 0) {
        const numberOfBags = totalQtyInKG / bagWeightKG;
        return numberOfBags % 1 === 0 ? numberOfBags : numberOfBags.toFixed(1);
      }
    }
    
    return totalQtyInKG;
  };


  const extractBagWeight = (productName) => {
    if (!productName) return null;
    const matches = productName.match(/(\d+)\s*KG/i);
    return matches && matches[1] ? parseInt(matches[1]) : null;
  };


  const calculateTotalBags = () => {
    if (!invoiceData?.Products_List) return 0;
    
    let totalBags = 0;
    invoiceData.Products_List.forEach(item => {
      const quantity = Number(item?.Bill_Qty || 0);
      const productName = item?.Product_Name || '';
      const bagWeight = extractBagWeight(productName);
      
      if (bagWeight && quantity > 0) {
        const bags = quantity / bagWeight;
        totalBags += bags;
      }
    });
    
    return totalBags;
  };

  const handleManualPDFDownload = async () => {
    await generatePDF(false);
  };

  const handleReprint = () => {
    setIsReprint(true);
    setModalOpen(true);
  };

  const handlePrintClick = () => {
    setIsReprint(false);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Invoice #{invoiceNo}...
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Preparing automatic PDF download...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }} 
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
        <Alert severity="warning">No invoice data available</Alert>
      </Container>
    );
  }

  const IS_IGST = isEqualNumber(invoiceData.IS_IGST, 1);

  const includedProducts = printData.Products_List.filter(
    product => isGraterNumber(product?.Bill_Qty, 0)
  );

  return (
    <>
      <div maxWidth="sm">
      

        {/* Rest of your existing UI */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            Invoice #{atob(invoiceNo)}
          </Typography>
          
          {printData && (
            <>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="h6">Company Information</Typography>
                  <Typography><strong>Name:</strong> {printData.company.name}</Typography>
                  <Typography><strong>Address:</strong> {printData.company.address}</Typography>
                  <Typography><strong>GSTIN:</strong> {printData.company.gst}</Typography>
                  <Typography><strong>Phone:</strong> {printData.company.phone}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="h6">Customer Information</Typography>
                  <Typography><strong>Name:</strong> {printData.customer.name}</Typography>
                  <Typography><strong>Address:</strong> {printData.customer.address}</Typography>
                  <Typography><strong>City:</strong> {printData.customer.city}</Typography>
                  <Typography><strong>GSTIN:</strong> {printData.customer.gst}</Typography>
                  <Typography><strong>Phone:</strong> {printData.customer.mobile}</Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6">Items</Typography>
                {printData.DeliveryItems && printData.DeliveryItems.map((item, index) => {
                  const bagWeight = extractBagWeight(item.Product_Name);
                  const numberOfBags = bagWeight && item.Bill_Qty > 0 ? calculateBags(item.Product_Name, item.Bill_Qty) : item.Bill_Qty;
                  
                  return (
                    <Card key={index} sx={{ mb: 1 }}>
                      <CardContent>
                        <Typography><strong>Product:</strong> {item.Product_Name}</Typography>
                        <Typography><strong>HSN:</strong> {item.HSN_Code}</Typography>
                        <Typography><strong>Rate:</strong> ₹{item.Item_Rate}</Typography>
                        <Typography><strong>Quantity:</strong> {item.Bill_Qty} KG ({numberOfBags} bags)</Typography>
                        <Typography><strong>Taxable Amount:</strong> ₹{item.Taxable_Amount}</Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
              
              <Box sx={{ mt: 4, textAlign: 'right' }}>
                <Typography variant="h6">Totals</Typography>
                <Typography><strong>Total Before Tax:</strong> ₹{printData.totals.totalBeforeTax}</Typography>
                {!IS_IGST && (
                  <>
                    <Typography><strong>CGST:</strong> ₹{printData.totals.cgst}</Typography>
                    <Typography><strong>SGST:</strong> ₹{printData.totals.sgst}</Typography>
                  </>
                )}
                {IS_IGST && (
                  <Typography><strong>IGST:</strong> ₹{printData.totals.igst}</Typography>
                )}
                <Typography><strong>Round Off:</strong> ₹{printData.totals.roundOff}</Typography>
                <Typography variant="h5"><strong>Grand Total:</strong> ₹{printData.totals.totalInvoiceValue}</Typography>
              </Box>
            </>
          )}
          
          {/* <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 4 }}>
            <Button variant="contained" onClick={handlePrintClick}>
              Print Invoice
            </Button>
            <Button variant="outlined" onClick={handleReprint}>
              Reprint Invoice
            </Button>
            <Button variant="contained" color="success" onClick={handleManualPDFDownload}>
              Download PDF
            </Button>
          </Box> */}
        </Paper>
      </div>
    </>
  );
};

export default InvoiceView;