export type OrderStatus =
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  items: OrderItem[];
}

export interface Pagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface OrdersResponse {
  data: Order[];
  meta: {
    pagination: Pagination;
  };
}