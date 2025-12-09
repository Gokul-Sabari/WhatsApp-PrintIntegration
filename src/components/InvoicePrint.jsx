import React, { forwardRef } from 'react'

const InvoicePrint = forwardRef(({ customer, cartItems, totals, storage, company }, ref) => {
 
  const safeNum = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const rupee = (n) =>
    safeNum(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div
      ref={ref}
      style={{
        width: "80mm",
        fontFamily: "Courier New, monospace",
        fontSize: "13px",
        padding: "3mm", 
        lineHeight: 1.4,
        color: "#000",
        fontWeight: "bold", 
      }}
    >

      <div style={{ 
        textAlign: "center", 
        fontWeight: "950", 
        borderBottom: "3px solid #000",
        marginBottom: "4mm", 
        fontSize: "18px", 
        paddingBottom: "3mm",
        textTransform: "uppercase",
        letterSpacing: "1px"
      }}>
        TAX INVOICE
      </div>

      {/* Company Info */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "3mm",
        fontWeight: "950",
        fontSize: "14px"
      }}>
        <div>{company?.Name || "YOUR COMPANY"}</div>
        <div style={{ fontSize: "11px" }}>
          GSTIN: {company?.GSTIN || "GSTINXXXXXXXXXXXX"}
        </div>
        <div style={{ fontSize: "11px" }}>
          Ph: {company?.Phone || "+91 XXXXX XXXXX"}
        </div>
      </div>

      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        marginBottom: "3mm", 
        minHeight: "5mm", 
        borderBottom: "2px solid #000",
        paddingBottom: "2mm",
        fontWeight: "950",
        fontSize: "12px" 
      }}>
        <div><strong>DATE:</strong> {new Date().toLocaleDateString("en-GB")}/{new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
        <div><strong>ISSUED BY:</strong> {storage?.UserName || "Admin"}</div>
      </div>

      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: "3mm", 
        minHeight: "5mm",
        fontWeight: "950"
      }}>
        <span style={{ 
          minWidth: "25mm", 
          fontWeight: 950,
          marginRight: "2mm", 
          fontSize: "13px"
        }}>INVOICE NO:</span>
        <div style={{ 
          flex: 1, 
          minHeight: "4mm", 
          fontSize: "13px", 
          fontWeight: "950"
        }}>INV-{new Date().getFullYear()}-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}</div>
      </div>

      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: "3mm", 
        minHeight: "5mm",
        fontWeight: "950"
      }}>
        <span style={{ 
          minWidth: "25mm", 
          fontWeight: 950,
          marginRight: "2mm", 
          fontSize: "13px"
        }}>CUSTOMER:</span>
        <div style={{ 
          flex: 1, 
          minHeight: "4mm", 
          fontSize: "13px", 
          fontWeight: "950"
        }}>{customer?.Billl_Name || customer?.Short_Name || customer?.Name || "—"}</div>
      </div>

      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: "3mm", 
        minHeight: "5mm",
        fontWeight: "950"
      }}>
        <span style={{ 
          minWidth: "25mm", 
          fontWeight: 950, 
          marginRight: "2mm", 
          fontSize: "13px" 
        }}>ADDRESS:</span>
        <div style={{ 
          flex: 1, 
          minHeight: "4mm", 
          fontSize: "13px",
          fontWeight: "950"
        }}>
          {[customer?.Address, customer?.City].filter(Boolean).join(", ") || "—"}
        </div>
      </div>

      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: "3mm", 
        minHeight: "5mm",
        fontWeight: "950"
      }}>
        <span style={{ 
          minWidth: "25mm", 
          fontWeight: 950, 
          marginRight: "2mm", 
          fontSize: "13px" 
        }}>PHONE:</span>
        <div style={{ 
          flex: 1, 
          minHeight: "4mm", 
          fontSize: "13px",
          fontWeight: "950"
        }}>{customer?.Mobile_No || customer?.Phone || customer?.Land_Line || "—"}</div>
      </div>

      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: "3mm", 
        minHeight: "5mm",
        fontWeight: "950"
      }}>
        <span style={{ 
          minWidth: "25mm", 
          fontWeight: 950, 
          marginRight: "2mm", 
          fontSize: "13px" 
        }}>GSTIN:</span>
        <div style={{ 
          flex: 1, 
          minHeight: "4mm", 
          fontSize: "13px",
          fontWeight: "950"
        }}>{customer?.GSTIN || "—"}</div>
      </div>

      <table style={{ 
        width: "100%", 
        borderCollapse: "collapse", 
        marginTop: "4mm", 
        border: "3px solid #000", 
        fontSize: "15px", 
        fontWeight: "950" 
      }}>
        <thead>
          <tr>
            <th style={{ 
              width: "15%", 
              border: "2px solid #000", 
              padding: "1mm",
              background: "#e0e0e0", 
              fontWeight: "950", 
              fontSize: "13px",
              height: "6mm",
              textTransform: "uppercase"
            }}>RATE</th>
            <th style={{ 
              width: "60%", 
              border: "2px solid #000", 
              padding: "2mm",
              background: "#e0e0e0",
              fontWeight: "950",
              fontSize: "13px",
              height: "7mm",
              textTransform: "uppercase"
            }}>ITEM NAME</th>
            <th style={{ 
              width: "10%", 
              border: "2px solid #000", 
              padding: "1mm",
              background: "#e0e0e0",
              fontWeight: "950",
              fontSize: "13px",
              height: "6mm",
              textTransform: "uppercase"
            }}>QTY</th>
            <th style={{ 
              width: "15%", 
              border: "2px solid #000", 
              padding: "1mm",
              background: "#e0e0e0",
              fontWeight: "950",
              fontSize: "13px",
              height: "6mm",
              textTransform: "uppercase"
            }}>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {cartItems && cartItems.length > 0 ? (
            cartItems.map((item, i) => (
              <tr key={i} style={{ height: "6mm", fontWeight: "950" }}>
                <td style={{ 
                  border: "2px solid #000", 
                  textAlign: "center", 
                  verticalAlign: "top", 
                  padding: "1mm",
                  fontWeight: "850", 
                  fontSize: "13px",
                  width: "15%"
                }}>₹{rupee(item.price)}</td>
                <td style={{ 
                  border: "2px solid #000", 
                  textAlign: "left", 
                  padding: "2mm",
                  paddingLeft: "2mm",
                  fontWeight: "950",
                  fontSize: "13px",
                  width: "60%"
                }}>{item.Print_Name || item.Item_Name || "Item"}</td>
                <td style={{ 
                  border: "2px solid #000", 
                  textAlign: "center", 
                  padding: "0.5mm", 
                  fontWeight: "950",
                  fontSize: "13px", 
                  width: "10%"
                }}>{Number(item.qty || item.Quantity).toFixed(0)}</td>
                <td style={{ 
                  border: "2px solid #000", 
                  textAlign: "center", 
                  padding: "0.5mm", 
                  fontWeight: "950",
                  fontSize: "13px", 
                  width: "15%"
                }}>₹{rupee(item.Total || (item.price * (item.qty || item.Quantity)))}
                </td>
              </tr>
            ))
          ) : (
            Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} style={{ height: "6mm" }}>
                <td style={{ border: "2px solid #000", height: "6mm", width: "15%" }}></td>
                <td style={{ border: "2px solid #000", height: "6mm", width: "60%" }}></td>
                <td style={{ border: "2px solid #000", height: "6mm", width: "10%" }}></td>
                <td style={{ border: "2px solid #000", height: "6mm", width: "15%" }}></td>
              </tr>
            ))
          )}
      
          <tr style={{ 
            fontWeight: "950", 
            background: "#d0d0d0", 
            borderTop: "3px solid #000" 
          }}>
            <td style={{ 
              padding: "1mm",
              fontWeight: "950",
              fontSize: "11px",
              width: "15%",
              textAlign: "center"
            }}>
              <strong>₹{rupee(totals?.subtotal)}</strong>
            </td>
            <td style={{ 
              textAlign: "center",
              fontWeight: "950",
              fontSize: "13px",
              width: "60%"
            }}>
              <strong>
                {cartItems && cartItems.length > 0 
                  ? cartItems.reduce((sum, item) => sum + safeNum(item.kgs), 0).toFixed(2)
                  : "0.00"
                } KGS
              </strong>
            </td>
            <td style={{ 
              textAlign: "center",
              fontWeight: "950",
              fontSize: "13px",
              width: "10%"
            }}>
              <strong>
                {cartItems && cartItems.length > 0 
                  ? cartItems.reduce((sum, item) => sum + safeNum(item.qty || item.Quantity), 0).toFixed(0)
                  : "0"
                }
              </strong>
            </td>
            <td style={{ 
              textAlign: "center",
              padding: "1mm",
              fontWeight: "950",
              fontSize: "13px",
              width: "15%"
            }}>
              <strong>₹{rupee(totals?.grandTotal || totals?.subtotal)}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tax and Total Summary */}
      <div style={{ marginTop: "4mm", fontSize: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1mm" }}>
          <span>Subtotal:</span>
          <span>₹{rupee(totals?.subtotal || 0)}</span>
        </div>
        {totals?.taxAmount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1mm" }}>
            <span>Tax ({totals?.taxRate || 18}%):</span>
            <span>₹{rupee(totals?.taxAmount || 0)}</span>
          </div>
        )}
        {totals?.roundOff !== 0 && totals?.roundOff && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1mm" }}>
            <span>Round Off:</span>
            <span>₹{rupee(totals?.roundOff)}</span>
          </div>
        )}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          marginTop: "2mm", 
          paddingTop: "2mm",
          borderTop: "2px solid #000",
          fontWeight: "950",
          fontSize: "14px"
        }}>
          <span>GRAND TOTAL:</span>
          <span>₹{rupee(totals?.grandTotal || totals?.subtotal || 0)}</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: "4mm", 
        paddingTop: "3mm", 
        borderTop: "1px solid #000",
        textAlign: "center", 
        fontSize: "10px",
        lineHeight: 1.3
      }}>
        <div>** THANK YOU FOR YOUR BUSINESS **</div>
        <div>This is a computer generated invoice</div>
        <div>No signature required</div>
      </div>
    </div>
  );
});

InvoicePrint.displayName = "InvoicePrint";

export default InvoicePrint;