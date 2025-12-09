import React from 'react'
import { Box, Typography, Divider, Grid } from '@mui/material'
import InvoiceHeader from './InvoiceHeader'
import InvoiceTable from './InvoiceTable'
import InvoiceTotals from './InvoiceTotal'
// src/components/InvoiceDisplay.jsx - Simplified version


const InvoiceDisplay = ({ data }) => {
  // Remove the imports for InvoiceHeader, InvoiceTable, InvoiceTotals
  // And use simple markup instead
  
  if (!data) return null
  
  const { Invoice_Info = {}, Customer_Info = {}, Products_List = [] } = data
  
  const rupee = (n) => Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  
  return (
    <Box sx={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
      {/* Simple header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">TAX INVOICE</Typography>
        <Typography variant="h6">INV-{Invoice_Info.Invoice_No}</Typography>
      </Box>
      
      {/* Simple table */}
      <Box sx={{ mt: 3 }}>
        {Products_List.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Typography>{item.Item_Name}</Typography>
            <Typography>₹{rupee(item.Total)}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default InvoiceDisplay