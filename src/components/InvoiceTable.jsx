import React from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography 
} from '@mui/material'

const InvoiceTable = ({ products = [] }) => {
  const safeNum = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d)
  const rupee = (n) => safeNum(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: 'primary.main' }}>
          <TableRow>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Item Name</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Qty</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Rate</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.length > 0 ? (
            products.map((item, index) => (
              <TableRow key={index} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {item.Print_Name || item.Item_Name || 'Product'}
                  </Typography>
                </TableCell>
                <TableCell align="right">{item.Quantity || item.qty || 0}</TableCell>
                <TableCell align="right">₹{rupee(item.Price || item.price || 0)}</TableCell>
                <TableCell align="right" fontWeight="bold">
                  ₹{rupee(item.Total || 0)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="body2" color="text.secondary">
                  No products added
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default InvoiceTable