import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, Button, DialogActions } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import InvoicePrint from './InvoicePrint';

const PrintInvoiceModal = ({ open, onClose, customer, cartItems, totals, storage, company, isReprint = false, onPrintAndSave }) => {
  
  const printRef = useRef();
  const [isPrinting, setIsPrinting] = useState(false);

  const handleReactPrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "InvoiceBill",
    onBeforeGetContent: () => {
      setIsPrinting(true);
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      toast.success("Invoice printed successfully");
    },
    onError: (err) => {
      setIsPrinting(false);
      console.error("Print Error:", err);
      toast.error("Print failed");
    },
  });

  const handlePrintAndSave = async () => {
    setIsPrinting(true);
    try {
      if (isReprint) {
     
        await handleReactPrint(); 
        toast.success("Invoice reprinted successfully");
        return true;
      } else {
       
        if (onPrintAndSave) {
          const result = await onPrintAndSave();
          if (result) {
            await handleReactPrint();
          }
          return result;
        } else {
     
          await handleReactPrint();
          return true;
        }
      }
    } catch (error) {
      console.error('Error in print operation:', error);
      toast.error('Error printing invoice');
      return false;
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle style={{ fontWeight: "bold", fontSize: "20px" }}>
        {isReprint ? 'Reprint Invoice' : 'Print Invoice'}
      </DialogTitle>
    
      <DialogContent>
        <InvoicePrint 
          ref={printRef} 
          customer={customer} 
          cartItems={cartItems} 
          totals={totals} 
          storage={storage}
          company={company}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          variant="outlined"
          disabled={isPrinting}
        >
          Close
        </Button>
        <Button 
          variant="contained" 
          onClick={handlePrintAndSave} 
          disabled={isPrinting}
          style={{ fontWeight: "bold" }}
        >
          {isPrinting ? 'Processing...' : (isReprint ? 'Reprint' : 'Print & Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrintInvoiceModal;