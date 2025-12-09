import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const generatePDF = async (invoiceData, invoiceNo) => {
  // Create a temporary div for PDF generation
  const element = document.createElement('div')
  element.style.position = 'absolute'
  element.style.left = '-9999px'
  element.style.width = '210mm' // A4 width
  
  // Generate HTML for PDF
  const html = generateInvoiceHTML(invoiceData, invoiceNo)
  element.innerHTML = html
  
  document.body.appendChild(element)
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: element.offsetWidth,
      height: element.offsetHeight,
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    let heightLeft = imgHeight
    let position = 0
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= 297 // A4 height
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= 297
    }
    
    pdf.save(`Invoice-${invoiceNo}.pdf`)
  } finally {
    document.body.removeChild(element)
  }
}

const generateInvoiceHTML = (data, invoiceNo) => {
  // Generate HTML string for the invoice
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; width: 210mm;">
      <h1 style="text-align: center; color: #333;">TAX INVOICE</h1>
      <!-- Add your invoice HTML structure here -->
    </div>
  `
}