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
  const Company   = (() => { try { return atob(companyId) } catch { return companyId } })()
  
 
  const [posData,     setPosData]     = useState([])
  const [companyInfo, setCompanyInfo] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [downloading, setDownloading] = useState(false)

  const printRef = useRef(null)
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  useEffect(() => {
    if (!Company) {
      setError('Missing Company_id')
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

        const base  = (compInfo.Back_End_API ?? '').replace(/\/+$/, '')
        // const today = getTodayDate()


        const res = await axios.get(`${base}/masters/rateDetails`, {
        //   params:  { FromDate: today },
          headers: { Accept: 'application/json' },
        })

        const data = res?.data?.data ?? res?.data ?? []
        if (!Array.isArray(data) || data.length === 0)
          throw new Error('No rate data found for today')

        setCompanyInfo(compInfo)
        setPosData(data)
      } catch (e) {
        setError(e?.response?.data?.message ?? e.message ?? 'Failed to load data')
      } finally {
        setLoading(false)
      }
    })()
  }, [Company])

 
  const downloadPDF = async () => {
    if (!printRef.current || downloading) return
    setDownloading(true)
    try {
      const opt = {
        margin:       [0.4, 0.4, 0.4, 0.4],
        filename:     `RateMaster-${getTodayDate()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
      }
      await html2pdf().set(opt).from(printRef.current).save()
    } catch (err) {
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    if (!loading && !error && posData.length > 0) {
      const timer = setTimeout(() => downloadPDF(), 1000)
      return () => clearTimeout(timer)
    }
  }, [loading, error, posData])


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
        <div style={{ fontSize: 32 }}></div>
        <p style={{ fontWeight: 700, margin: '8px 0 4px' }}>{error}</p>
        <p style={{ fontSize: 11, color: '#888' }}>Company: {companyId}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )


  const activeData   = posData.filter(i => i.Is_Active_Decative === 1)


  const groupByBrand = (data) =>
    data.reduce((acc, item) => {
      const key = item.POS_Brand_Name || 'Other'
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})

  const activeGroups   = groupByBrand(activeData)


  const rateDate = posData[0]?.Rate_Date ? formatDate(posData[0].Rate_Date) : getTodayDate()

  const thStyle = {
    border: '1px solid #000', padding: '6px 8px',
    backgroundColor: '#f0f0f0', fontWeight: 'bold',
    fontSize: 11, textAlign: 'left',
  }
  const tdStyle = {
    border: '1px solid #000', padding: '5px 8px', fontSize: 11,
  }
  const brandStyle = {
    backgroundColor: '#FFFF00', fontWeight: 'bold',
    fontSize: 12, padding: '5px 8px',
    border: '1px solid #000', colSpan: 2,
  }

  const renderGroup = (groups) =>
    Object.entries(groups).map(([brandName, products]) => (
      <React.Fragment key={brandName}>
        {/* Brand header row */}
        <tr>
          <td colSpan={2} style={brandStyle}>{brandName}</td>
        </tr>
        {/* Product rows */}
        {products.map((item, i) => (
          <tr key={i}>
            <td style={tdStyle}>{item.Short_Name || item.Product_Name || '-'}</td>
            <td style={{ ...tdStyle, textAlign: 'right' }}>{item.Max_Rate ?? '-'}</td>
          </tr>
        ))}
      </React.Fragment>
    ))

 
  return (
    <div style={{
      padding: isMobile ? '10px' : '20px',
      maxWidth: 800, margin: '20px auto',
      fontFamily: 'Arial, sans-serif',
    }}>


      <div className="no-print" style={{
        textAlign: 'right', marginBottom: 10,
        position: 'sticky', top: 10, zIndex: 100,
      }}>
        <button
          onClick={downloadPDF}
          disabled={downloading}
          style={{
            backgroundColor: '#1976d2', color: '#fff',
            border: 'none', borderRadius: 6,
            padding: '8px 18px', fontSize: 14,
            fontWeight: 600, cursor: downloading ? 'wait' : 'pointer',
            opacity: downloading ? 0.7 : 1,
            display: isMobile ? 'none' : 'inline-block',
          }}
        >
          {downloading ? 'Downloading…' : 'Download Rate Master PDF'}
        </button>
      </div>


      <div ref={printRef} style={{
        padding: isMobile ? '5px' : '10px',
        backgroundColor: '#fff',
        fontSize: 11, lineHeight: '1.4',
      }}>

        {/* Title */}
        <h2 style={{ textAlign: 'center', margin: '0 0 4px', fontSize: 16 }}>
          {companyInfo?.Company_Name || 'Company'} — Price List
        </h2>
        <p style={{ textAlign: 'center', margin: '0 0 12px', fontSize: 12, color: '#555' }}>
          Date: {rateDate}
        </p>

        {activeData.length > 0 && (
          <>
          
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Product Name</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Rate (₹)</th>
                </tr>
              </thead>
              <tbody>{renderGroup(activeGroups)}</tbody>
            </table>
          </>
        )}

      

        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 10, color: '#888' }}>
          This is a Computer Generated Rate Master
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print { .no-print { display: none !important; } }
      `}</style>
    </div>
  )
}