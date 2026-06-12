// import React, { useEffect, useState, useRef } from 'react'
// import { useSearchParams } from 'react-router-dom'
// import axios from 'axios'
// import html2pdf from 'html2pdf.js'

// const CACHE = new Map()

// const getTodayDate = () => {
//   const d = new Date()
//   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
// }

// const formatDate = (dateStr) => {
//   if (!dateStr) return getTodayDate()
//   return dateStr.split('T')[0].split('-').reverse().join('-')
// }

// const S = {
//   center: {
//     display: 'flex', flexDirection: 'column',
//     alignItems: 'center', justifyContent: 'center',
//     minHeight: '60vh', fontFamily: 'Arial, sans-serif',
//   },
//   spinner: {
//     width: 40, height: 40, border: '4px solid #eee',
//     borderTop: '4px solid #1976d2', borderRadius: '50%',
//     animation: 'spin 0.8s linear infinite',
//   },
//   errBox: {
//     textAlign: 'center', padding: '24px 32px',
//     border: '1px solid #f5c2c7', borderRadius: 8,
//     backgroundColor: '#fff5f5', color: '#c0392b',
//   },
// }

// export default function RateMaster() {

 
//   useEffect(() => {
//     const ua = navigator.userAgent || ''
//     const isWhatsApp = /WhatsApp/i.test(ua)
//     const isAndroid  = /Android/i.test(ua)
//     const isIOS      = /iPhone|iPad|iPod/i.test(ua)

//     if (isWhatsApp) {
//       const currentUrl = window.location.href
//       if (isAndroid) {
//         window.location.href =
//           `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;end`
//       } else if (isIOS) {
//         document.body.innerHTML = `
//           <div style="text-align:center; padding:40px; font-family:Arial;">
//             <h2>Open in Browser</h2>
//             <p>Tap the 3 dots (⋯) at the top right</p>
//             <p>Then tap <strong>"Open in Safari"</strong></p>
//             <br/>
//             <a href="${currentUrl}" style="
//               background:#1976d2; color:#fff; padding:14px 28px;
//               border-radius:8px; text-decoration:none; font-size:16px;
//             ">Open Rate Master</a>
//           </div>
//         `
//       }
//     }
//   }, [])

 
//   const [sp]      = useSearchParams()
//   const companyId = sp.get('Company_id') ?? ''
//   const Company   = (() => { try { return atob(companyId) } catch { return companyId } })()
  
 
//   const [posData,     setPosData]     = useState([])
//   const [companyInfo, setCompanyInfo] = useState(null)
//   const [loading,     setLoading]     = useState(true)
//   const [error,       setError]       = useState('')
//   const [downloading, setDownloading] = useState(false)

//   const printRef = useRef(null)
//   const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

//   useEffect(() => {
//     if (!Company) {
//       setError('Missing Company_id')
//       setLoading(false)
//       return
//     }

//     ;(async () => {
//       try {
//         let compInfo = CACHE.get(`ci_${Company}`)
//         if (!compInfo) {
//           const r = await fetch(
//             `https://pukalfoods.erpsmt.in/api/masters/company/url?Company_id=${Company}`
//           )
//           const d = await r.json()
//           if (!d.success || !d.data) throw new Error('Company info not found')
//           compInfo = d.data
//           CACHE.set(`ci_${Company}`, compInfo)
//         }

//         const base  = (compInfo.Back_End_API ?? '').replace(/\/+$/, '')
//         // const today = getTodayDate()


//         const res = await axios.get(`${base}/masters/rateDetails`, {
//         //   params:  { FromDate: today },
//           headers: { Accept: 'application/json' },
//         })

//         const data = res?.data?.data ?? res?.data ?? []
//         if (!Array.isArray(data) || data.length === 0)
//           throw new Error('No rate data found for today')

//         setCompanyInfo(compInfo)
//         setPosData(data)
//       } catch (e) {
//         setError(e?.response?.data?.message ?? e.message ?? 'Failed to load data')
//       } finally {
//         setLoading(false)
//       }
//     })()
//   }, [Company])

 
//   const downloadPDF = async () => {
//     if (!printRef.current || downloading) return
//     setDownloading(true)
//     try {
//       const opt = {
//         margin:       [0.4, 0.4, 0.4, 0.4],
//         filename:     `RateMaster-${getTodayDate()}.pdf`,
//         image:        { type: 'jpeg', quality: 0.98 },
//         html2canvas:  { scale: 2, useCORS: true },
//         jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
//       }
//       await html2pdf().set(opt).from(printRef.current).save()
//     } catch (err) {
//       alert('Failed to generate PDF. Please try again.')
//     } finally {
//       setDownloading(false)
//     }
//   }

//   useEffect(() => {
//     if (!loading && !error && posData.length > 0) {
//       const timer = setTimeout(() => downloadPDF(), 1000)
//       return () => clearTimeout(timer)
//     }
//   }, [loading, error, posData])


//   if (loading) return (
//     <div style={S.center}>
//       <div style={S.spinner} />
//       <p style={{ marginTop: 16, color: '#555', fontFamily: 'Arial' }}>Loading rate master…</p>
//       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//     </div>
//   )

//   if (error) return (
//     <div style={S.center}>
//       <div style={S.errBox}>
//         <div style={{ fontSize: 32 }}></div>
//         <p style={{ fontWeight: 700, margin: '8px 0 4px' }}>{error}</p>
//         <p style={{ fontSize: 11, color: '#888' }}>Company: {companyId}</p>
//       </div>
//       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//     </div>
//   )


//   const activeData   = posData.filter(i => i.Is_Active_Decative === 1)


//   const groupByBrand = (data) =>
//     data.reduce((acc, item) => {
//       const key = item.POS_Brand_Name || 'Other'
//       if (!acc[key]) acc[key] = []
//       acc[key].push(item)
//       return acc
//     }, {})

//   const activeGroups   = groupByBrand(activeData)


//   const rateDate = posData[0]?.Rate_Date ? formatDate(posData[0].Rate_Date) : getTodayDate()

//   const thStyle = {
//     border: '1px solid #000', padding: '6px 8px',
//     backgroundColor: '#f0f0f0', fontWeight: 'bold',
//     fontSize: 11, textAlign: 'left',
//   }
//   const tdStyle = {
//     border: '1px solid #000', padding: '5px 8px', fontSize: 11,
//   }
//   const brandStyle = {
//     backgroundColor: '#FFFF00', fontWeight: 'bold',
//     fontSize: 12, padding: '5px 8px',
//     border: '1px solid #000', colSpan: 2,
//   }

//   const renderGroup = (groups) =>
//     Object.entries(groups).map(([brandName, products]) => (
//       <React.Fragment key={brandName}>
//         {/* Brand header row */}
//         <tr>
//           <td colSpan={2} style={brandStyle}>{brandName}</td>
//         </tr>
//         {/* Product rows */}
//         {products.map((item, i) => (
//           <tr key={i}>
//             <td style={tdStyle}>{item.Short_Name || item.Product_Name || '-'}</td>
//             <td style={{ ...tdStyle, textAlign: 'right' }}>{item.Max_Rate ?? '-'}</td>
//           </tr>
//         ))}
//       </React.Fragment>
//     ))

 
//   return (
//     <div style={{
//       padding: isMobile ? '10px' : '20px',
//       maxWidth: 800, margin: '20px auto',
//       fontFamily: 'Arial, sans-serif',
//     }}>


//       <div className="no-print" style={{
//         textAlign: 'right', marginBottom: 10,
//         position: 'sticky', top: 10, zIndex: 100,
//       }}>
//         <button
//           onClick={downloadPDF}
//           disabled={downloading}
//           style={{
//             backgroundColor: '#1976d2', color: '#fff',
//             border: 'none', borderRadius: 6,
//             padding: '8px 18px', fontSize: 14,
//             fontWeight: 600, cursor: downloading ? 'wait' : 'pointer',
//             opacity: downloading ? 0.7 : 1,
//             display: isMobile ? 'none' : 'inline-block',
//           }}
//         >
//           {downloading ? 'Downloading…' : 'Download Rate Master PDF'}
//         </button>
//       </div>


//       <div ref={printRef} style={{
//         padding: isMobile ? '5px' : '10px',
//         backgroundColor: '#fff',
//         fontSize: 11, lineHeight: '1.4',
//       }}>

//         {/* Title */}
//         <h2 style={{ textAlign: 'center', margin: '0 0 4px', fontSize: 16 }}>
//           {companyInfo?.Company_Name || 'Company'} — Price List
//         </h2>
//         <p style={{ textAlign: 'center', margin: '0 0 12px', fontSize: 12, color: '#555' }}>
//           Date: {rateDate}
//         </p>

//         {activeData.length > 0 && (
//           <>
          
//             <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
//               <thead>
//                 <tr>
//                   <th style={thStyle}>Product Name</th>
//                   <th style={{ ...thStyle, textAlign: 'right' }}>Rate (₹)</th>
//                 </tr>
//               </thead>
//               <tbody>{renderGroup(activeGroups)}</tbody>
//             </table>
//           </>
//         )}

      

//         <div style={{ textAlign: 'center', marginTop: 10, fontSize: 10, color: '#888' }}>
//           This is a Computer Generated Rate Master
//         </div>
//       </div>

//       <style>{`
//         @keyframes spin { to { transform: rotate(360deg); } }
//         @media print { .no-print { display: none !important; } }
//       `}</style>
//     </div>
//   )
// }








import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import html2pdf from 'html2pdf.js'

const CACHE = new Map()

const getTodayDate = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return getTodayDate()
  return dateStr.split('T')[0].split('-').reverse().join('-')
}

const S = {
  center: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', fontFamily: 'Arial, sans-serif',
  },
  spinner: {
    width: 40, height: 40, border: '4px solid #eee',
    borderTop: '4px solid #1976d2', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errBox: {
    textAlign: 'center', padding: '24px 32px',
    border: '1px solid #f5c2c7', borderRadius: 8,
    backgroundColor: '#fff5f5', color: '#c0392b',
  },
}

const WEIGHT_RE = /^(.*?)\s*(\d+\s*(?:KGS?|GMS?|G|LTR|L|ML))\s*$/i

const extractBaseName = (name = '') => {
  const m = (name.trim()).match(WEIGHT_RE)
  return m ? m[1].trim() : name.trim()
}

const extractWeight = (name = '') => {
  const m = (name.trim()).match(WEIGHT_RE)
  return m ? m[2].trim().toUpperCase() : null
}

const mergeWeightVariants = (data) => {
  const map = new Map()

  data.forEach(item => {
    const modifiedName = (item.Item_Name_Modified || '').trim()
    const shortName    = (item.Short_Name || '').trim()
    const productName  = (item.Product_Name || '').trim()

    const baseName = extractBaseName(modifiedName) || extractBaseName(productName)
    const weight = extractWeight(productName)
    const shortBase = extractBaseName(shortName) || shortName
    const rate  = item.Max_Rate
    const brand = item.POS_Brand_Name || 'Other'

    const key = `${brand}__${baseName.toUpperCase()}__${rate}`

    if (map.has(key)) {
      const existing = map.get(key)
      const w = weight?.toUpperCase()
      if (w && !existing._weights.includes(w)) {
        existing._weights.push(w)
        existing._displayName = `${existing._shortBase} ${existing._weights.join(' & ')}`
      }
    } else {
      const weights = weight ? [weight.toUpperCase()] : []
      map.set(key, {
        ...item,
        _weights:     weights,
        _shortBase:   shortBase,
        _displayName: weights.length ? `${shortBase} ${weights[0]}` : shortBase,
      })
    }
  })

  return Array.from(map.values())
}

export default function RateMaster() {

  useEffect(() => {
    const ua = navigator.userAgent || ''
    const isWhatsApp = /WhatsApp/i.test(ua)
    const isAndroid  = /Android/i.test(ua)
    const isIOS      = /iPhone|iPad|iPod/i.test(ua)

    if (isWhatsApp) {
      const currentUrl = window.location.href
      if (isAndroid) {
        window.location.href =
          `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;end`
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
            ">Open Rate Master</a>
          </div>
        `
      }
    }
  }, [])

  const [sp]      = useSearchParams()
  const companyId = sp.get('Company_id') ?? ''
  const Company   = (() => { 
    try { 
      return atob(companyId) 
    } catch { 
      return companyId 
    } 
  })()

  const [posData,     setPosData]     = useState([])
  const [companyInfo, setCompanyInfo] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [downloading, setDownloading] = useState(false)
  const [pdfGenerated, setPdfGenerated] = useState(false)
  const [timeFor, setTimeFor] = useState(0)
  const printRef = useRef(null)
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  useEffect(() => {
    if (!Company) {
      setError('Missing Company_id')
      setLoading(false)
      return
    }

    const fetchData = async () => {
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

         const base  = (compInfo.Back_End_API ?? '').replace(/\/+$/, '')

        const res = await axios.get(`${base}/masters/rateDetails`, {
          headers: { Accept: 'application/json' },
        })
       
        const data = res?.data?.data?.posRateMaster ?? res?.data ?? []
        const timeData = res?.data?.data?.metadata?.latestRateTime;

        const convertTo12HourFormat = (dateTimeString) => {
          if (!dateTimeString) return null;
          const timePart = dateTimeString.split('T')[1];
          const [hours, minutes] = timePart.split(':');
          const hour = parseInt(hours);
          const period = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes} ${period}`;
        };

        const formattedTime = convertTo12HourFormat(timeData);
   
        if (!Array.isArray(data) || data.length === 0)
          throw new Error('No rate data found for today')
        
        setTimeFor(formattedTime)
        setCompanyInfo(compInfo)
        setPosData(data)
      } catch (e) {
        console.error('Fetch error:', e)
        setError(e?.response?.data?.message ?? e.message ?? 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [Company])

  const downloadPDF = async () => {
    if (!printRef.current || downloading) return
    
    setDownloading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    try {
      const element = printRef.current;
      
      const opt = {
        margin:        [0.5, 0.5, 0.5, 0.5],
        filename:     `PriceList- ${getTodayDate()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: {
          unit: 'in',
          format: 'a4',
          orientation: 'portrait'
        }
      }
      
      await html2pdf().set(opt).from(element).save()
    } catch (err) {
      console.error('PDF Error:', err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  // Auto-download when data is ready
  useEffect(() => {
    if (!loading && !error && posData.length > 0 && !pdfGenerated) {
      setPdfGenerated(true)
      const timer = setTimeout(() => {
        downloadPDF()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [loading, error, posData, pdfGenerated])

  if (loading) return (
    <div style={S.center}>
      <div style={S.spinner} />
      <p style={{ marginTop: 16, color: '#555', fontFamily: 'Arial' }}>Loading rate master…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (error) return (
    <div style={S.center}>
      <div style={S.errBox}>
        <div style={{ fontSize: 32 }}>⚠️</div>
        <p style={{ fontWeight: 700, margin: '8px 0 4px' }}>{error}</p>
        <p style={{ fontSize: 11, color: '#888' }}>Company: {companyId}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const activeData = posData.filter(i => i.Is_Active_Decative === 1)
  const mergedData = mergeWeightVariants(activeData)


  const sortByLevels = (data) => {
    return [...data].sort((a, b) => {
   
      const brandLevelA = a.Brand_Level !== null && a.Brand_Level !== undefined ? Number(a.Brand_Level) : 999;
      const brandLevelB = b.Brand_Level !== null && b.Brand_Level !== undefined ? Number(b.Brand_Level) : 999;
      
      if (brandLevelA !== brandLevelB) {
        return brandLevelA - brandLevelB;
      }
      

      const itemLevelA = a.Item_Level !== null && a.Item_Level !== undefined ? Number(a.Item_Level) : 999;
      const itemLevelB = b.Item_Level !== null && b.Item_Level !== undefined ? Number(b.Item_Level) : 999;
      
      if (itemLevelA !== itemLevelB) {
        return itemLevelA - itemLevelB;
      }
      

      const brandNameA = (a.POS_Brand_Name || '').toLowerCase();
      const brandNameB = (b.POS_Brand_Name || '').toLowerCase();
      
      if (brandNameA !== brandNameB) {
        return brandNameA.localeCompare(brandNameB);
      }
      
      const productNameA = (a.Short_Name || a.Product_Name || '').toLowerCase();
      const productNameB = (b.Short_Name || b.Product_Name || '').toLowerCase();
      
      return productNameA.localeCompare(productNameB);
    });
  };

  const sortedData = sortByLevels(mergedData);

  const groupByBrand = (data) =>
    data.reduce((acc, item) => {
      const key = item.POS_Brand_Name || 'Other'
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})

  const activeGroups = groupByBrand(sortedData)
  const rateDate = posData[0]?.Rate_Date ? formatDate(posData[0].Rate_Date) : getTodayDate()

  const thStyle = {
    padding: '8px 8px',
    backgroundColor: '#FFFF00', 
    fontWeight: 'bold',
    fontSize: 10, 
    textAlign: 'left',
  }
  
  const tdStyle = {
    border: '0.01px solid #000', 
    padding: '3px 3px', 
    fontSize: 9,
  }
  
  const brandStyle = {
    backgroundColor: '#28a745',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
    padding: '3px 3px',
    textAlign: 'center',
  }
  
  const dividerStyle = {}
  
  const numberFormat = (Max_Rate) => {
    const formatrate = new Intl.NumberFormat("en-IN").format(Max_Rate);
    return formatrate
  }

  const renderGroup = (groups) => {
    const entries = Object.entries(groups)
    return entries.map(([brandName, products], index) => {
      // Create pairs for two-column layout
      const pairs = []
      const halfLength = Math.ceil(products.length / 2)
      
      for (let i = 0; i < halfLength; i++) {
        const leftItem = products[i]
        const rightItem = products[i + halfLength] || null
        pairs.push([leftItem, rightItem])
      }
      
      return (
        <React.Fragment key={brandName}>
          <tr className="brand-header-row">
            <td colSpan={4} style={brandStyle}>{brandName}</td>
          </tr>
          {pairs.map(([left, right], i) => (
            <tr key={i} className="data-row">
              <td style={tdStyle}>
                {left?._weights?.length >= 2 ? left._displayName : (left?.Short_Name || '-')}
                {left?.Item_Level && <span style={{ fontSize: 7, color: '#666', marginLeft: 4 }}></span>}
              </td>
              <td style={{ ...tdStyle, textAlign: 'right', ...dividerStyle }}>
                {numberFormat(left?.Max_Rate ?? '-')}
              </td>
              <td style={tdStyle}>
                {right ? (right?._weights?.length >= 2 ? right._displayName : (right?.Short_Name || '-')) : ''}
                {right?.Item_Level && <span style={{ fontSize: 7, color: '#666', marginLeft: 4 }}></span>}
              </td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                {right ? numberFormat(right?.Max_Rate ?? '-') : ''}
              </td>
            </tr>
          ))}
        </React.Fragment>
      )
    })
  }

  return (
    <div style={{
      padding: isMobile ? '10px' : '20px',
      maxWidth: '100%',
      margin: '20px auto',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
    }}>

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
            backgroundColor: '#1976d2', 
            color: '#fff',
            border: 'none', 
            borderRadius: 6,
            padding: '8px 18px', 
            fontSize: 14,
            fontWeight: 600, 
            cursor: downloading ? 'wait' : 'pointer',
            opacity: downloading ? 0.7 : 1,
          }}
        >
          {downloading ? 'Downloading…' : 'Download Rate Master PDF'}
        </button>
      </div>

      {/* PDF Content */}
      <div 
        ref={printRef} 
        style={{
          padding: '20px',
          backgroundColor: '#fff',
          fontSize: 11,
          lineHeight: '1.4',
          display: 'block',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 4px', fontSize: 16, fontWeight: 'bold' }}>
            {rateDate} {timeFor} ,{companyInfo?.Company_Name || 'Company'} - Price List
          </h2>
        </div>

        {mergedData.length > 0 ? (
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            marginBottom: 20,
            border: '1px solid #000',
          }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '35%' }}>Product Name</th>
                <th style={{ ...thStyle, textAlign: 'right', width: '15%', ...dividerStyle }}>Rate (₹)</th>
                <th style={{ ...thStyle, width: '35%' }}>Product Name</th>
                <th style={{ ...thStyle, textAlign: 'right', width: '15%' }}>Rate (₹)</th>
              </tr>
            </thead>
            <tbody>
              {renderGroup(activeGroups)}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            No active products found
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 10, color: '#888' }}>
          This is a Computer Generated Rate Master
        </div>
      </div>
      
      <style>{`
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
        
        @media print { 
          .no-print { 
            display: none !important; 
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
        
        table { 
          border-collapse: collapse;
          width: 100%;
        }
        
        thead {
          display: table-header-group;
        }
        
        tbody tr {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        @page {
          size: A4;
          margin: 0.5in;
        }
      `}</style>
    </div>
  )
}

