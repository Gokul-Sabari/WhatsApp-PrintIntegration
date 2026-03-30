import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import html2pdf from 'html2pdf.js'


const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const LD  = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '-'

const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
  'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']

function n2w(n) {
  if (!n || n === 0) return 'Zero'
  const h = (x) => {
    let r = ''
    if (x >= 100) { r += ones[Math.floor(x / 100)] + ' Hundred '; x %= 100 }
    if (x >= 20)  { r += tens[Math.floor(x / 10)]  + ' '; x %= 10 }
    if (x > 0)    r += ones[x] + ' '
    return r
  }
  let r = '', x = Math.abs(Math.round(n))
  const cr = Math.floor(x / 10000000); x %= 10000000
  const la = Math.floor(x / 100000);   x %= 100000
  const th = Math.floor(x / 1000);     x %= 1000
  if (cr) r += h(cr) + 'Crore '
  if (la) r += h(la) + 'Lakh '
  if (th) r += h(th) + 'Thousand '
  if (x)  r += h(x)
  return r.trim()
}

const taxCalc = (method = 0, amount = 0, pct = 0) => {
  if (method === 0) return amount * (pct / 100)
  if (method === 1) return amount - amount * (100 / (100 + pct))
  return 0
}


const CACHE = {
  get: (k) => {
    try {
      const x = JSON.parse(sessionStorage.getItem(k))
      return x ? x.v : null
    } catch { return null }
  },
  set: (k, v) => {
    try { sessionStorage.setItem(k, JSON.stringify({ v })) } catch {}
  }
}


export default function DownloadPdfView() {


  useEffect(() => {
    const ua = navigator.userAgent || '';
    const isWhatsApp = /WhatsApp/i.test(ua);
    const isAndroid  = /Android/i.test(ua);
    const isIOS      = /iPhone|iPad|iPod/i.test(ua);

    if (isWhatsApp) {
      const currentUrl = window.location.href;

      if (isAndroid) {
        window.location.href = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;end`;
      } else if (isIOS) {
     
        document.body.innerHTML = `
          <div style="text-align:center; padding:40px; font-family:Arial;">
            <h2>Open in Browser</h2>
            <p>Tap the 3 dots (⋯) at the top right</p>
            <p>Then tap <strong>"Open in Safari"</strong></p>
            <br/>
            <a href="${currentUrl}" style="
              background:#1976d2; color:#fff; padding:14px 28px;
              border-radius:8px; text-decoration:none; font-size:16px;
            ">Open Invoice</a>
          </div>
        `;
      }
    }
  }, []);

  const [sp]      = useSearchParams()
  const rawInvNo  = sp.get('Do_Inv_No')  ?? ''
  const companyId = sp.get('Company_id') ?? ''

  const Company = (() => { try { return atob(companyId) } catch { return companyId } })()
  const doInvNo = (() => { try { return atob(rawInvNo).replace(/_/g, '/').trim() } catch { return rawInvNo } })()

  const [companyInfo,        setCompanyInfo]        = useState(null)
  const [companyInfoDetails, setCompanyInfoDetails] = useState(null)
  const [invoice,            setInvoice]            = useState(null)
  const [retailersDetails,   setRetailersDetails]   = useState(null)
  const [loading,            setLoading]            = useState(true)
  const [error,              setError]              = useState('')
  const [downloading,        setDownloading]        = useState(false)

  const printRef = useRef(null)


  const downloadPDF = async () => {
    if (!printRef.current || downloading) return;
    
    setDownloading(true);
    
    try {
      const element = printRef.current;
      const opt = {
        margin:        [0.5, 0.5, 0.5, 0.5],
        filename:     `Invoice-${invoice?.Do_Inv_No || 'Invoice'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, letterRendering: true, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(element).save();
    

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  // ✅ AUTO DOWNLOAD - Triggers automatically after invoice loads
  useEffect(() => {
    if (!loading && !error && invoice) {
      const timer = setTimeout(() => {
        downloadPDF();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, error, invoice]);


  useEffect(() => {
    if (!Company || !rawInvNo) {
      setError(!Company ? 'Missing Company_id' : 'Missing Do_Inv_No')
      setLoading(false)
      return
    }

    ;(async () => {
      try {
   
        let compInfo = CACHE.get(`ci_${Company}`)
        if (!compInfo) {
          const r = await fetch(
            `https://pukalfoods.erpsmt.in/api/masters/company/url?Company_id=${Company}`
          )
          const d = await r.json()
          if (!d.success || !d.data) throw new Error('Company info not found')
          compInfo = d.data
          CACHE.set(`ci_${Company}`, compInfo)
        }

        const base = (compInfo.Back_End_API ?? '').replace(/\/+$/, '')


        const [invoiceRes, companyRes] = await Promise.all([
          axios.get(`${base}/sales/getInvoiceDetails`, {
            params:  { Do_Inv_No: doInvNo },
            headers: { Accept: 'application/json' },
          }),
          axios.get(`${base}/masters/company`, {
            headers: { Accept: 'application/json' },
          }),
        ])

        const inv = Array.isArray(invoiceRes?.data?.data)
          ? invoiceRes.data.data[0]
          : (invoiceRes?.data?.data ?? invoiceRes?.data)
        if (!inv) throw new Error('Invoice not found in response')

        const retailerId = inv.Retailer_Id || inv.Retailers_Id


        let retailerDetails = null
        try {
          const rRes = await axios.get(`${base}/masters/retailers/info`, {
            params:  { Retailer_Id: retailerId },
            headers: { Accept: 'application/json' },
          })
           
          const rData = rRes?.data.data ?? rRes?.data.data
          retailerDetails = Array.isArray(rData)
            ? rData.find(r => r.Retailer_Id == retailerId || r.Retailers_Id == retailerId)
            : rData

        } catch {
          const rRes = await axios.get(`${base}/masters/retailers/info`, {
            headers: { Accept: 'application/json' },
          })
     
          const rData = rRes?.data.data ?? rRes?.data.data
          retailerDetails = Array.isArray(rData)
            ? rData.find(r => r.Retailer_Id == retailerId || r.Retailers_Id == retailerId)
            : rData
        }

        setCompanyInfo(compInfo)
        setCompanyInfoDetails(companyRes?.data?.data?.[0] ?? null)
        setRetailersDetails(retailerDetails)
        setInvoice(inv)

      } catch (e) {
        setError(e?.response?.data?.message ?? e.message ?? 'Failed to load data')
      } finally {
        setLoading(false)
      }
    })()
  }, [Company, rawInvNo, doInvNo])


  if (loading) return (
    <div style={S.center}>
      <div style={S.spinner} />
      <p style={{ marginTop: 16, color: '#555' }}>Loading invoice…</p>
    </div>
  )

  if (error || !invoice) return (
    <div style={S.center}>
      <div style={S.errBox}>
        <div style={{ fontSize: 32 }}>⚠️</div>
        <p style={{ fontWeight: 700, margin: '8px 0 4px' }}>{error || 'Invoice not found'}</p>
        <p style={{ fontSize: 11, color: '#888' }}>Invoice: {doInvNo} | Company: {companyId}</p>
      </div>
    </div>
  )


  const inv      = invoice
  const products = (inv.Products_List ?? []).filter(p => Number(p.Bill_Qty) > 0)
  const expenses = inv.Expence_Array ?? []
  const staffs   = inv.Staffs_Array  ?? []

  const broker      = staffs.find(s => s.Involved_Emp_Type === 'Broker')    ?? null
  const transporter = staffs.find(s => s.Involved_Emp_Type === 'Transport') ?? null

  const isIGST  = Number(inv.IS_IGST) === 1
  const gstMode = Number(inv.GST_Inclusive)

  const safeProducts = products.map(p => {
    const pct      = isIGST ? (p.Igst || 0) : ((p.Cgst || 0) + (p.Sgst || 0))
    const rate     = Number(p.Item_Rate || 0)
    const itemTax  = taxCalc(gstMode, rate, pct)
    const rateIncl = gstMode === 0 ? rate + itemTax : rate
    const rateExcl = gstMode === 1 ? rate - itemTax : rate
    return {
      ...p,
      Unit_Name:          p.Unit_Name || p.UOM || 'KG',
      Rate_Inclusive_Tax: rateIncl,
      Taxable_Rate:       rateExcl,
    }
  })

  const totalQty     = safeProducts.reduce((s, p) => s + Number(p.Bill_Qty       || 0), 0)
  const totalTaxable = safeProducts.reduce((s, p) => s + Number(p.Taxable_Amount || 0), 0)
  const totalCGST    = safeProducts.reduce((s, p) => s + Number(p.Cgst_Amo       || 0), 0)
  const totalSGST    = safeProducts.reduce((s, p) => s + Number(p.Sgst_Amo       || 0), 0)
  const totalIGST    = safeProducts.reduce((s, p) => s + Number(p.Igst_Amo       || 0), 0)
  const totalTax     = totalCGST + totalSGST + totalIGST
  const invoiceTotal = Number(inv.Total_Invoice_value || 0)

  const hsnMap = new Map()
  safeProducts.forEach(p => {
    const key = p.HSN_Code || 'N/A'
    if (!hsnMap.has(key)) hsnMap.set(key, {
      taxable: 0, cgstRate: p.Cgst || 0, sgstRate: p.Sgst || 0, igstRate: p.Igst || 0,
      cgstAmt: 0, sgstAmt: 0, igstAmt: 0,
    })
    const r = hsnMap.get(key)
    r.taxable += Number(p.Taxable_Amount || 0)
    r.cgstAmt += Number(p.Cgst_Amo      || 0)
    r.sgstAmt += Number(p.Sgst_Amo      || 0)
    r.igstAmt += Number(p.Igst_Amo      || 0)
  })

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  const bStyle  = { border:       '1px solid #000' }
  const bRight  = { borderRight:  '1px solid #000' }
  const bBottom = { borderBottom: '1px solid #000' }
  const bTop    = { borderTop:    '1px solid #000' }

  const thBase = {
    padding: isMobile ? '4px' : '8px',
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    fontSize: isMobile ? '9px' : '11px',
    whiteSpace: 'nowrap',
  }
  const tdBase = {
    padding: isMobile ? '4px' : '8px',
    fontSize: isMobile ? '9px' : '11px',
  }


  return (
    <div style={{
      padding: isMobile ? '10px' : '20px',
      maxWidth: '1100px',
      margin: '20px auto',
      fontFamily: 'Arial, sans-serif',
    }}>

      {/* ✅ Button hidden on mobile (auto-downloads), visible on desktop */}
      <div className="no-print" style={{
        textAlign: 'right',
        marginBottom: 10,
        position: 'sticky',
        top: 10,
        zIndex: 100,
      }}>
        <button 
          onClick={downloadPDF} 
          disabled={downloading}
          style={{
            ...S.printBtn,
            width:   isMobile ? '100%' : 'auto',
            padding: isMobile ? '12px 16px' : '8px 16px',
            fontSize: isMobile ? '14px' : 'inherit',
            opacity: downloading ? 0.7 : 1,
            cursor: downloading ? 'wait' : 'pointer',
            display: isMobile ? 'none' : 'block',  // ✅ Hidden on mobile
          }}
        >
          {downloading ? 'Downloading...' : 'Download Invoice PDF'}
        </button>
      </div>

      <div ref={printRef} style={{
        padding: isMobile ? '5px' : '10px',
        backgroundColor: '#fff',
        fontSize: isMobile ? '10px' : '11px',
        lineHeight: '1.3',
        overflowX: 'auto',
      }}>

        <h2 style={{ textAlign: 'center', margin: '0 0 10px', fontSize: isMobile ? '14px' : 'inherit' }}>
          {companyInfoDetails?.Company_id === 1 ? 'TAX INVOICE' : 'SALES INVOICE'}
        </h2>

        <div style={{ ...bStyle, marginBottom: 15 }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>

            <div style={{
              width: isMobile ? '100%' : '50%',
              ...(isMobile ? {} : bRight),
              padding: isMobile ? '8px' : '10px',
              borderBottom: isMobile ? bBottom.borderBottom : 'none',
            }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: isMobile ? '14px' : '18px', fontWeight: 'bold', marginBottom: 5 }}>
                  {companyInfoDetails?.Company_Name || inv.Branch_Name}
                </div>
                <div style={{ wordBreak: 'break-word' }}>{companyInfoDetails?.Company_Address}</div>
                <div>GSTIN/UIN: {companyInfo?.Gst_Number || companyInfoDetails?.Gst_Number || '-'}</div>
                <div>Region: {companyInfoDetails?.Region}, State: {companyInfoDetails?.State}</div>
                <div>Contact: {companyInfoDetails?.Telephone_Number}</div>
              </div>

              <div style={{ ...bBottom, ...bTop, paddingBottom: 10, marginBottom: 8, wordBreak: 'break-word' }}>
                <strong>Consignee (Ship to)</strong><br />
                {inv.shippingName || inv.Retailer_Name}<br />
                {inv.shippingDeliveryAddress}<br />
                Phone No: {inv.shippingPhoneNumber}<br />
                GSTIN/UIN: {inv.shippingGstNumber || '-'}<br />
                State Name: {inv.shippingStateName}
              </div>

              <div style={{ wordBreak: 'break-word' }}>
                <strong>Buyer (Bill to)</strong><br />
                {retailersDetails?.Retailer_Name}<br />
                {retailersDetails?.Reatailer_Address}<br />
                Phone No: {retailersDetails?.Mobile_No}<br />
                GSTIN/UIN: {retailersDetails?.Gstno || '-'}<br />
                State Name: {inv.shippingStateName}
              </div>
            </div>

            <div style={{ width: isMobile ? '100%' : '50%', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? '9px' : '11px' }}>
                <tbody>
                  {[
                    ['Invoice No.',        inv.Do_Inv_No,               'Dated',              LD(inv.Do_Date)],
                    ['Delivery Note',      '-',                          'Mode/Terms Payment', '-'],
                    ['Reference No.',      inv.Ref_Inv_Number || '-',    'Other References',   broker?.Emp_Name || '-'],
                    ["Buyer's Order No.",  '-',                          'Dated',              '-'],
                    ['Dispatch Doc No.',   '-',                          'Delivery Note Date', '-'],
                    ['Dispatched through', transporter?.Emp_Name || '-', 'Destination',        inv.shippingCityName || '-'],
                    ['LR-RR No.',          '-',                          'Motor Vehicle No.',  '-'],
                  ].map(([l1, v1, l2, v2], i) => (
                    <tr key={i} style={bBottom}>
                      <td style={{ ...tdBase, ...bRight, color: '#555', whiteSpace: 'nowrap' }}>
                        <strong>{l1}</strong><br />
                        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{v1}</div>
                      </td>
                      <td style={{ ...tdBase, ...bRight, color: '#555', whiteSpace: 'nowrap' }}>
                        <strong>{l2}</strong><br />
                        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{v2}</div>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4} style={tdBase}><strong>Terms of Delivery:</strong> –</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ ...bStyle, marginBottom: 15, lineHeight: 1, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '800px' : 'auto' }}>
              <thead>
                <tr style={bBottom}>
                  {['Sl', 'Description of Goods', 'HSN/SAC', 'Quantity', 'Bags',
                    'Rate (Incl. Tax)', 'Rate (Excl. Tax)', 'Per', 'Amount'].map((h, i, arr) => (
                    <th key={i} style={{
                      ...thBase,
                      ...(i < arr.length - 1 ? bRight : {}),
                      textAlign: i > 4 ? 'right' : i === 1 ? 'left' : 'center',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {safeProducts.length > 0 ? safeProducts.map((p, i) => (
                  <tr key={i}>
                    <td style={{ ...tdBase, ...bRight, textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ ...tdBase, ...bRight, wordBreak: 'break-word' }}>
                      {p.Short_Name && p.Short_Name !== '0' && p.Short_Name.trim()
                        ? p.Short_Name : p.Product_Name}
                    </td>
                    <td style={{ ...tdBase, ...bRight, textAlign: 'center' }}>{p.HSN_Code || '-'}</td>
                    <td style={{ ...tdBase, ...bRight, textAlign: 'center' }}>{p.Bill_Qty} {p.Unit_Name}</td>
                    <td style={{ ...tdBase, ...bRight, textAlign: 'center' }}>{p.Bag || 0}</td>
                    <td style={{ ...tdBase, ...bRight, textAlign: 'right' }}>{fmt(p.Rate_Inclusive_Tax)}</td>
                    <td style={{ ...tdBase, ...bRight, textAlign: 'right' }}>{fmt(p.Taxable_Rate)}</td>
                    <td style={{ ...tdBase, ...bRight, textAlign: 'center' }}>{p.Unit_Name}</td>
                    <td style={{ ...tdBase, textAlign: 'right' }}>{fmt(p.Taxable_Amount)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={9} style={{ ...tdBase, textAlign: 'center' }}>No products found</td>
                  </tr>
                )}

                {expenses.map((exp, i) => {
                  const val = Number(exp.Expence_Value || 0)
                  return (
                    <tr key={`exp-${i}`}>
                      <td style={{ ...tdBase, ...bRight }} />
                      <td style={{ ...tdBase, ...bRight, fontStyle: 'italic', wordBreak: 'break-word' }}>{exp.Expence_Name}</td>
                      <td style={{ ...tdBase, ...bRight }} />
                      <td style={{ ...tdBase, ...bRight }} />
                      <td style={{ ...tdBase, ...bRight }} />
                      <td style={{ ...tdBase, ...bRight }} />
                      <td style={{ ...tdBase, ...bRight }} />
                      <td style={{ ...tdBase, ...bRight }} />
                      <td style={{ ...tdBase, textAlign: 'right', color: val < 0 ? 'red' : 'black' }}>
                        {fmt(val)}
                      </td>
                    </tr>
                  )
                })}

                <tr style={{ ...bTop, backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                  <td style={{ ...tdBase, ...bRight }} colSpan={3}>Total</td>
                  <td style={{ ...tdBase, ...bRight, textAlign: 'right' }}>{totalQty} KG</td>
                  <td style={{ ...tdBase, ...bRight }} />
                  <td style={{ ...tdBase, ...bRight }} />
                  <td style={{ ...tdBase, ...bRight }} />
                  <td style={{ ...tdBase, ...bRight }} />
                  <td style={{ ...tdBase, textAlign: 'right' }}>{fmt(invoiceTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: 15, wordBreak: 'break-word' }}>
            <strong>Amount Chargeable (in words) E. &amp; O.E</strong><br />
            <strong>INR {n2w(Math.round(invoiceTotal))} Only</strong>
          </div>

          <div style={{ ...bStyle, marginBottom: 15, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '600px' : 'auto' }}>
              <thead>
                <tr style={bBottom}>
                  <th style={{ ...thBase, ...bRight }} rowSpan={2}>HSN/SAC</th>
                  <th style={{ ...thBase, ...bRight }} rowSpan={2}>Taxable Value</th>
                  <th style={{ ...thBase, ...bRight }} colSpan={2}>{isIGST ? 'IGST' : 'CGST'}</th>
                  {!isIGST && <th style={{ ...thBase, ...bRight }} colSpan={2}>SGST</th>}
                  <th style={thBase}>Total Tax Amount</th>
                </tr>
                <tr style={bBottom}>
                  <th style={{ ...thBase, ...bRight }}>Rate</th>
                  <th style={{ ...thBase, ...bRight }}>Amount</th>
                  {!isIGST && <>
                    <th style={{ ...thBase, ...bRight }}>Rate</th>
                    <th style={{ ...thBase, ...bRight }}>Amount</th>
                  </>}
                  <th style={thBase} />
                </tr>
              </thead>
              <tbody>
                {Array.from(hsnMap.entries()).length > 0
                  ? Array.from(hsnMap.entries()).map(([hsn, rec], i) => (
                    <tr key={i}>
                      <td style={{ ...tdBase, ...bRight }}>{hsn}</td>
                      <td style={{ ...tdBase, ...bRight, textAlign: 'right' }}>{fmt(rec.taxable)}</td>
                      <td style={{ ...tdBase, ...bRight, textAlign: 'center' }}>
                        {isIGST ? rec.igstRate + '%' : rec.cgstRate + '%'}
                      </td>
                      <td style={{ ...tdBase, ...bRight, textAlign: 'right' }}>
                        {isIGST ? fmt(rec.igstAmt) : fmt(rec.cgstAmt)}
                      </td>
                      {!isIGST && <>
                        <td style={{ ...tdBase, ...bRight, textAlign: 'center' }}>{rec.sgstRate}%</td>
                        <td style={{ ...tdBase, ...bRight, textAlign: 'right' }}>{fmt(rec.sgstAmt)}</td>
                      </>}
                      <td style={{ ...tdBase, textAlign: 'right' }}>
                        {fmt(rec.cgstAmt + rec.sgstAmt + rec.igstAmt)}
                      </td>
                    </tr>
                  ))
                  : <tr>
                      <td colSpan={isIGST ? 5 : 7} style={{ ...tdBase, textAlign: 'center' }}>
                        No tax data found
                      </td>
                    </tr>
                }
                <tr style={{ ...bTop, backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                  <td style={{ ...tdBase, ...bRight }}>Total</td>
                  <td style={{ ...tdBase, ...bRight, textAlign: 'right' }}>{fmt(totalTaxable)}</td>
                  <td style={{ ...tdBase, ...bRight }} />
                  <td style={{ ...tdBase, ...bRight, textAlign: 'right' }}>
                    {isIGST ? fmt(totalIGST) : fmt(totalCGST)}
                  </td>
                  {!isIGST && <>
                    <td style={{ ...tdBase, ...bRight }} />
                    <td style={{ ...tdBase, ...bRight, textAlign: 'right' }}>{fmt(totalSGST)}</td>
                  </>}
                  <td style={{ ...tdBase, textAlign: 'right' }}>{fmt(totalTax)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
            gap: isMobile ? '12px' : '0',
          }}>
            <div style={{ width: isMobile ? '100%' : '50%', wordBreak: 'break-word' }}>
              <strong>Tax Amount (in words):</strong><br />
              INR {n2w(Math.round(totalTax))} Only
            </div>
            <div style={{
              width: isMobile ? '100%' : '50%',
              textAlign: isMobile ? 'left' : 'right',
              wordBreak: 'break-word',
            }}>
              <strong>Company's Bank Details</strong><br />
              Bank Name: {companyInfoDetails?.Bank_Name || '-'}<br />
              A/c No.: {companyInfoDetails?.Account_Number || '-'}<br />
              Branch &amp; IFSC Code: {companyInfoDetails?.Bank_Branch_Name} {companyInfoDetails?.IFC_Code || '-'}
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            ...bStyle,
            padding: isMobile ? '10px' : '15px',
            marginTop: 15,
            gap: isMobile ? '15px' : '0',
          }}>
            <div style={{ width: isMobile ? '100%' : '60%', wordBreak: 'break-word' }}>
              <strong>Declaration</strong>
              <p style={{ fontStyle: 'italic', marginTop: 5, marginBottom: 0 }}>
                We declare that this invoice shows the actual price of the goods described
                and that all particulars are true and correct.
              </p>
            </div>
            <div style={{ textAlign: isMobile ? 'left' : 'right', width: isMobile ? '100%' : '40%' }}>
              <div>for {companyInfoDetails?.Company_Name || inv.Branch_Name}</div>
              <div style={{ marginTop: isMobile ? 10 : 40 }}>Authorised Signatory</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 15, padding: 8 }}>
            This is a Computer Generated Invoice
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print { .no-print { display: none !important; } }
        @media (max-width: 768px) { body { -webkit-text-size-adjust: 100%; } }
      `}</style>
    </div>
  )
}

// ── Styles ──────────────────────────────────────────────────────────────────
const S = {
  center: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '80vh', padding: '20px', textAlign: 'center',
  },
  spinner: {
    width: 40, height: 40, border: '4px solid #eee',
    borderTop: '4px solid #1a237e', borderRadius: '50%',
    animation: 'spin .8s linear infinite',
  },
  errBox: {
    textAlign: 'center', padding: 28, background: '#fff3f3',
    border: '1px solid #ffcdd2', borderRadius: 8, maxWidth: 400, width: '90%',
  },
  printBtn: {
    background: '#1976d2', color: '#fff', border: 'none',
    cursor: 'pointer', fontWeight: 'bold', borderRadius: 4,
  },
}