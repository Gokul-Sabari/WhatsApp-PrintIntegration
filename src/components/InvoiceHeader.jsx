import React from 'react'
import { Box, Typography } from '@mui/material'

const InvoiceHeader = ({ 
  invoiceNo = 'INV-001',
  invoiceDate = new Date().toLocaleDateString('en-GB'),
  companyInfo = {},
  branchInfo = {}
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
      <Box>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          {companyInfo.Name || 'Your Company'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {branchInfo.Name || 'Main Branch'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {branchInfo.Address || 'Company Address'}
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
          TAX INVOICE
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 1 }}>
          <Typography variant="body2" fontWeight="bold">Invoice No:</Typography>
          <Typography variant="body2">{invoiceNo}</Typography>
          <Typography variant="body2" fontWeight="bold">Date:</Typography>
          <Typography variant="body2">{invoiceDate}</Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default InvoiceHeader