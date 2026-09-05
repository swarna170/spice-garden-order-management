import { apiClient } from "./client";
import type {
  Order,
  OrderStatus,
  OrdersResponse,
} from "../types/order";
import type { Customer } from "../types/customer";

/* =====================================================
   GET ORDERS
===================================================== */

export async function getOrders(params?: {
  search?: string;
  status?: OrderStatus | "";
  customerId?: string;
  page?: number;
  size?: number;
}) {
  const query = new URLSearchParams();

  if (params?.search) {
    query.set("search", params.search);
  }

  if (params?.status) {
    query.set("status", params.status);
  }

  if (params?.customerId) {
    query.set("customerId", params.customerId);
  }

  query.set("page", String(params?.page ?? 1));
  query.set("size", String(params?.size ?? 10));

  const queryString = query.toString();

  return apiClient<OrdersResponse>(
    `/orders${queryString ? `?${queryString}` : ""}`,
  );
}

/* =====================================================
   GET SINGLE ORDER
===================================================== */

export async function getOrder(id: string) {
  return apiClient<{ data: Order }>(
    `/orders/${id}`,
  );
}

/* =====================================================
   CREATE ORDER
===================================================== */

export async function createOrder(input: {
  customer: {
    id: string | null;
    name: string;
    email: string | null;
    phone: string;
  };

  items: {
    itemName: string;
    quantity: number;
    unitPrice: number;
  }[];
}) {
  return apiClient<{ data: Order }>(
    "/orders",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

/* =====================================================
   UPDATE ORDER STATUS
===================================================== */

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
) {
  return apiClient<{ data: Order }>(
    `/orders/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    },
  );
}

/* =====================================================
   ADD ORDER ITEM
===================================================== */

export async function addOrderItem(
  id: string,
  item: {
    itemName: string;
    quantity: number;
    unitPrice: number;
  },
) {
  return apiClient<{ data: Order }>(
    `/orders/${id}/items`,
    {
      method: "POST",
      body: JSON.stringify(item),
    },
  );
}

/* =====================================================
   DELETE ORDER ITEM
===================================================== */

export async function deleteOrderItem(
  orderId: string,
  itemId: string,
) {
  return apiClient<{ data: Order }>(
    `/orders/${orderId}/items/${itemId}`,
    {
      method: "DELETE",
    },
  );
}

/* =====================================================
   GET CUSTOMERS
===================================================== */

export async function getCustomers() {
  return apiClient<{
    data: Customer[];
    meta: {
      pagination: {
        page: number;
        size: number;
        total: number;
        totalPages: number;
      };
    };
  }>("/customers?page=1&size=100");
}