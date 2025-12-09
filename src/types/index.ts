export interface CustomerInfo {
  Name?: string;
  Address?: string;
  City?: string;
  State?: string;
  Pincode?: string;
  GSTIN?: string;
  Phone?: string;
  Email?: string;
  Mobile_No?: string;
  Land_Line?: string;
  Billl_Name?: string;
  Short_Name?: string;
  Party_Location?: string;
  Transporter?: string;
  Broker?: string;
}

export interface ProductItem {
  ID?: number;
  Item_Code?: string;
  Item_Name?: string;
  Print_Name?: string;
  HSN_Code?: string;
  Unit?: string;
  Quantity?: number;
  Price?: number;
  Discount?: number;
  Tax_Rate?: number;
  Tax_Amount?: number;
  Total?: number;
  qty?: number;
  price?: number;
  kgs?: number;
}

export interface CompanyInfo {
  Name?: string;
  Address?: string;
  City?: string;
  State?: string;
  Pincode?: string;
  GSTIN?: string;
  Phone?: string;
  Email?: string;
  Logo?: string;
}

export interface BranchInfo {
  Name?: string;
  Address?: string;
}

export interface TaxBreakdown {
  Tax_Type?: string;
  Tax_Rate?: number;
  Tax_Amount?: number;
}

export interface PaymentSummary {
  Payments?: any[];
  Total_Paid?: number;
  Balance?: number;
}

export interface DeliverySummary {
  Deliveries?: any[];
  Delivery_Status?: string;
  Total_Deliveries?: number;
}

export interface InvoiceInfo {
  Invoice_No?: string;
  Date?: string;
  Order_No?: string;
  Voucher_Type?: string;
  GST_Inclusive?: boolean;
  IS_IGST?: boolean;
  Place_Of_Supply?: string;
  Subtotal?: number;
  Tax_Amount?: number;
  Round_off?: number;
  Grand_Total?: number;
  Narration?: string;
}

export interface InvoiceData {
  Invoice_Info?: InvoiceInfo;
  Customer_Info?: CustomerInfo;
  Company_Info?: CompanyInfo;
  Branch_Info?: BranchInfo;
  Products_List?: ProductItem[];
  Tax_Breakdown?: TaxBreakdown[];
  Payment_Summary?: PaymentSummary;
  Delivery_Summary?: DeliverySummary;
  Sales_Person_Info?: {
    Name?: string;
  };
  Calculated_Fields?: {
    Percent_Delivered?: number;
  };
}

export interface User {
  UserName?: string;
  Email?: string;
  Role?: string;
}

export interface PrintInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  data: InvoiceData;
  onPrintAndSave?: () => Promise<boolean>;
  user?: User;
  isReprint?: boolean;
}