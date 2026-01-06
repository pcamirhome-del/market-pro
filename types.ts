
export type Role = 'مدير' | 'موظف';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  phone: string;
  address: string;
  startDate: string;
  permissions: string[];
}

export interface Product {
  code: string;
  name: string;
  priceBeforeTax: number;
  priceAfterTax: number;
  stock: number;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  products: Product[];
}

export interface InvoiceItem {
  code: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Invoice {
  id: number;
  companyId: string;
  companyName: string;
  date: string;
  items: InvoiceItem[];
  totalValue: number;
  status: 'تم التسليم' | 'لم يتم التسليم';
  payments: number[];
  paidAmount: number;
  remaining: number;
}

export interface Sale {
  id: string;
  date: string;
  items: InvoiceItem[];
  totalValue: number;
  received: number;
  change: number;
}

export interface AppSettings {
  programName: string;
  profitMargin: number;
  sideMenuNames: Record<string, string>;
}
