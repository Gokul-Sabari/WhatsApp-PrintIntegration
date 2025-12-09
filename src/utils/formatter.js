// Currency formatter
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0.00'
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Date formatter
export const formatDate = (dateString, format = 'medium') => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  
  if (format === 'short') {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    })
  }
  
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Phone number formatter
export const formatPhone = (phone) => {
  if (!phone) return 'N/A'
  
  const cleaned = phone.toString().replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`
  }
  
  return phone
}

// GSTIN formatter
export const formatGSTIN = (gstin) => {
  if (!gstin) return 'Not Available'
  
  if (gstin.length === 15) {
    return `${gstin.substring(0, 2)}${gstin.substring(2, 10)}${gstin.substring(10, 13)}${gstin.substring(13)}`
  }
  
  return gstin
}