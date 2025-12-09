import React from 'react'
import { Grid, Box, Typography, Divider } from '@mui/material'

const InvoiceTotals = ({
  subtotal = 0,
  taxAmount = 0,
  roundOff = 0,
  grandTotal = 0,
  taxBreakdown = []
}) => {
  const rupee = (n) => Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Tax Breakdown
            </Typography>
            {taxBreakdown.length > 0 ? (
              taxBreakdown.map((tax, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {tax.Tax_Type || 'Tax'} @ {tax.Tax_Rate || 0}%
                  </Typography>
                  <Typography variant="body2">₹{rupee(tax.Tax_Amount)}</Typography>
                </Box>
              ))
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Tax Amount:</Typography>
                <Typography variant="body2">₹{rupee(taxAmount)}</Typography>
              </Box>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 1.5 }}>
            <Typography variant="body2" fontWeight="bold">Subtotal:</Typography>
            <Typography variant="body2" align="right">₹{rupee(subtotal)}</Typography>
            
            <Typography variant="body2" fontWeight="bold">Tax Amount:</Typography>
            <Typography variant="body2" align="right">₹{rupee(taxAmount)}</Typography>
            
            {roundOff !== 0 && (
              <>
                <Typography variant="body2" fontWeight="bold">Round Off:</Typography>
                <Typography variant="body2" align="right">₹{rupee(roundOff)}</Typography>
              </>
            )}
            
            <Divider sx={{ gridColumn: '1 / span 2', my: 1 }} />
            
            <Typography variant="h6" fontWeight="bold">Grand Total:</Typography>
            <Typography variant="h6" fontWeight="bold" align="right" color="primary">
              ₹{rupee(grandTotal)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default InvoiceTotals