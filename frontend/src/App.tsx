import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  IndianRupee,
  Loader2,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";

import {
  addOrderItem,
  deleteOrderItem,
  getOrder,
  getOrders,
  updateOrderStatus,
} from "./api/orders";

import { apiClient } from "./api/client";

import type {
  Customer,
  Order,
  OrderStatus,
} from "./types/order";


// =========================================================
// CONSTANTS
// =========================================================

const STATUS_OPTIONS: OrderStatus[] = [
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  CONFIRMED:
    "bg-[#f4edf0] text-[#795568] border-[#e5d6dc]",
  PREPARING:
    "bg-[#f7f0e7] text-[#9a7047] border-[#eadbc8]",
  READY:
    "bg-[#edf3f1] text-[#55786f] border-[#d4e4df]",
  COMPLETED:
    "bg-[#edf3ec] text-[#557454] border-[#d5e2d3]",
  CANCELLED:
    "bg-[#f5eded] text-[#986666] border-[#e6d3d3]",
};


// =========================================================
// HELPERS
// =========================================================

function formatCurrency(value: string | number) {
  return `₹${Number(value).toFixed(2)}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getNextStatuses(status: OrderStatus): OrderStatus[] {
  const transitions: Record<OrderStatus, OrderStatus[]> = {
    CONFIRMED: ["PREPARING", "CANCELLED"],
    PREPARING: ["READY", "CANCELLED"],
    READY: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
  };

  return transitions[status];
}


// =========================================================
// LAYOUT
// =========================================================

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf8f6] text-[#263044]">
      <header className="border-b border-[#eadfe0] bg-[#fffdfb]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3e8ec] text-[#765467]">
              <UtensilsCrossed size={22} strokeWidth={1.8} />
            </div>

            <div>
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#263044]">
                Spice Garden
              </h1>
              <p className="text-xs text-[#929aaa]">
                Restaurant Order Management
              </p>
            </div>
          </Link>

          <Link
            to="/orders/new"
            className="flex items-center gap-2 rounded-xl bg-[#79576a] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#694a5b]"
          >
            <Plus size={17} />
            New Order
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}


// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}


// =========================================================
// DASHBOARD
// =========================================================

function Dashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const result = await getOrders({
        search,
        status,
        page,
        size: 10,
      });

      setOrders(result.data);
      setPagination(result.meta.pagination);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, status, page]);

  const stats = useMemo(() => {
    return {
      total: pagination.total,
      active: orders.filter(
        (order) =>
          order.status === "CONFIRMED" ||
          order.status === "PREPARING" ||
          order.status === "READY"
      ).length,
      completed: orders.filter(
        (order) => order.status === "COMPLETED"
      ).length,
      revenue: orders.reduce(
        (sum, order) => sum + Number(order.totalAmount),
        0
      ),
    };
  }, [orders, pagination.total]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatus(value: OrderStatus | "") {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-[#a17889]">
            Overview
          </p>

          <h2 className="font-serif text-4xl font-semibold tracking-tight text-[#263044]">
            Order Dashboard
          </h2>

          <p className="mt-2 text-[#8e96a5]">
            Manage today's restaurant orders and customer activity.
          </p>
        </div>

        <Link
          to="/orders/new"
          className="flex w-fit items-center gap-2 rounded-xl bg-[#79576a] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#694a5b]"
        >
          <Plus size={18} />
          Create Order
        </Link>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ClipboardList size={20} />}
          label="Total Orders"
          value={pagination.total}
        />

        <StatCard
          icon={<Clock3 size={20} />}
          label="Active Orders"
          value={stats.active}
        />

        <StatCard
          icon={<ShoppingBag size={20} />}
          label="Completed"
          value={stats.completed}
        />

        <StatCard
          icon={<IndianRupee size={20} />}
          label="Current Page Revenue"
          value={formatCurrency(stats.revenue)}
        />
      </section>

      {/* Orders */}
      <section className="overflow-hidden rounded-2xl border border-[#e9dfe0] bg-white shadow-[0_10px_35px_rgba(62,44,50,0.05)]">
        <div className="border-b border-[#eee5e4] px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-[#263044]">
                Recent Orders
              </h3>
              <p className="mt-1 text-sm text-[#969dab]">
                Search and filter restaurant orders.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a8b3]"
                />

                <input
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search orders..."
                  className="w-full rounded-xl border border-[#e4dada] bg-[#fffdfc] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#9a7485] sm:w-64"
                />
              </div>

              <select
                value={status}
                onChange={(e) =>
                  handleStatus(
                    e.target.value as OrderStatus | ""
                  )
                }
                className="rounded-xl border border-[#e4dada] bg-[#fffdfc] px-4 py-2.5 text-sm text-[#596171] outline-none focus:border-[#9a7485]"
              >
                <option value="">All Statuses</option>

                {STATUS_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {STATUS_LABELS[item]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : orders.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-[#fcfaf9]">
                  <tr className="border-b border-[#eee5e4] text-left text-xs uppercase tracking-wider text-[#9ba1ad]">
                    <th className="px-6 py-4 font-medium">
                      Order
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Customer
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Items
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Total
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() =>
                        navigate(`/orders/${order.id}`)
                      }
                      className="cursor-pointer border-b border-[#f0e9e8] transition hover:bg-[#fdf9fa]"
                    >
                      <td className="px-6 py-5">
                        <p className="font-medium text-[#303747]">
                          {order.orderNumber}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-medium text-[#303747]">
                          {order.customer?.name ?? "Unknown"}
                        </p>

                        <p className="mt-1 text-xs text-[#9ba1ad]">
                          {order.customer?.phone ?? ""}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm text-[#6e7685]">
                        {order.itemCount}
                      </td>

                      <td className="px-6 py-5 font-medium text-[#303747]">
                        {formatCurrency(order.totalAmount)}
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge status={order.status} />
                      </td>

                      <td className="px-6 py-5 text-sm text-[#7e8694]">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-[#eee5e4] px-6 py-4">
              <p className="text-sm text-[#969dab]">
                Page {pagination.page} of{" "}
                {Math.max(pagination.totalPages, 1)}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(current - 1, 1)
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4dada] text-[#707887] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                </button>

                <button
                  disabled={
                    page >= pagination.totalPages ||
                    pagination.totalPages === 0
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        current + 1,
                        pagination.totalPages
                      )
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4dada] text-[#707887] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}


// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#e9dfe0] bg-white p-5 shadow-[0_8px_28px_rgba(62,44,50,0.04)]">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4ebee] text-[#79576a]">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-sm text-[#969dab]">{label}</p>

      <p className="mt-1 text-2xl font-semibold text-[#293244]">
        {value}
      </p>
    </div>
  );
}


// =========================================================
// ORDER DETAILS
// =========================================================

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] =
    useState<number | "">(1);
  const [itemPrice, setItemPrice] =
    useState<number | "">(0);

  const [addingItem, setAddingItem] = useState(false);
  const [deletingItemId, setDeletingItemId] =
    useState<string | null>(null);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [showAddItem, setShowAddItem] = useState(true);

  async function loadOrder() {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const result = await getOrder(id);
      setOrder(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load order."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function handleAddItem() {
    if (!id) return;

    const trimmedName = itemName.trim();

    if (!trimmedName) {
      alert("Please enter an item name.");
      return;
    }

    if (
      itemQuantity === "" ||
      Number(itemQuantity) < 1
    ) {
      alert("Quantity must be at least 1.");
      return;
    }

    if (
      itemPrice === "" ||
      !Number.isFinite(Number(itemPrice)) ||
      Number(itemPrice) <= 0
    ) {
      alert("Unit price must be greater than 0.");
      return;
    }

    try {
      setAddingItem(true);

      const result = await addOrderItem(id, {
        itemName: trimmedName,
        quantity: Number(itemQuantity),
        unitPrice: Number(itemPrice),
      });

      setOrder(result.data);

      setItemName("");
      setItemQuantity(1);
      setItemPrice("");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to add item."
      );
    } finally {
      setAddingItem(false);
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!id || !order) return;

    if (order.items.length <= 1) {
      alert(
        "An order must contain at least one item. The last item cannot be deleted."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove this item?"
    );

    if (!confirmed) return;

    try {
      setDeletingItemId(itemId);

      const result = await deleteOrderItem(id, itemId);

      // Use the updated order returned by the API immediately.
      // This prevents the deleted item from remaining visible in the UI.
      setOrder(result.data);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to delete item."
      );
    } finally {
      setDeletingItemId(null);
    }
  }

  async function handleStatusChange(
    newStatus: OrderStatus
  ) {
    if (!id) return;

    try {
      setUpdatingStatus(true);

      const result = await updateOrderStatus(
        id,
        newStatus
      );

      setOrder(result.data);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to update status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  const previewTotal =
    itemQuantity !== "" && itemPrice !== ""
      ? Number(itemQuantity) * Number(itemPrice)
      : 0;

  if (loading) {
    return <LoadingState />;
  }

  if (error || !order) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-[#79576a]"
        >
          <ArrowLeft size={17} />
          Back to orders
        </button>

        <ErrorState
          message={error || "Order not found."}
        />
      </div>
    );
  }

  const nextStatuses = getNextStatuses(order.status);

  return (
    <div className="space-y-7">
      {/* Back */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-sm font-medium text-[#79576a] transition hover:text-[#604354]"
      >
        <ArrowLeft size={17} />
        Back to orders
      </button>

      {/* Header */}
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.18em] text-[#a17889]">
            Order Details
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-serif text-4xl font-semibold tracking-tight text-[#263044]">
              {order.orderNumber}
            </h2>

            <StatusBadge status={order.status} />
          </div>

          <p className="mt-2 text-sm text-[#949baa]">
            Created on {formatDate(order.createdAt)}
          </p>
        </div>

        {nextStatuses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((nextStatus) => (
              <button
                key={nextStatus}
                disabled={updatingStatus}
                onClick={() =>
                  handleStatusChange(nextStatus)
                }
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 ${STATUS_STYLES[nextStatus]}`}
              >
                {updatingStatus ? (
                  <Loader2
                    size={15}
                    className="mr-2 inline animate-spin"
                  />
                ) : null}

                Mark {STATUS_LABELS[nextStatus]}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Customer */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#e9dfe0] bg-white p-6 shadow-[0_8px_28px_rgba(62,44,50,0.04)] lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4ebee] text-[#79576a]">
              <UserRound size={20} />
            </div>

            <div>
              <h3 className="font-serif text-xl font-semibold text-[#293244]">
                Customer
              </h3>

              <p className="text-sm text-[#9aa0ab]">
                Customer information
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <InfoField
              label="Name"
              value={order.customer?.name ?? "—"}
            />

            <InfoField
              label="Phone"
              value={order.customer?.phone ?? "—"}
            />

            <InfoField
              label="Email"
              value={order.customer?.email ?? "—"}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#e9dfe0] bg-[#79576a] p-6 text-white shadow-[0_8px_28px_rgba(62,44,50,0.08)]">
          <p className="text-sm text-white/70">
            Order Total
          </p>

          <p className="mt-3 font-serif text-4xl font-semibold">
            {formatCurrency(order.totalAmount)}
          </p>

          <div className="mt-7 flex items-center justify-between border-t border-white/15 pt-4 text-sm">
            <span className="text-white/70">
              Total items
            </span>

            <span className="font-medium">
              {order.itemCount}
            </span>
          </div>
        </div>
      </section>

      {/* Order Items */}
      <section className="overflow-hidden rounded-2xl border border-[#e9dfe0] bg-white shadow-[0_8px_28px_rgba(62,44,50,0.04)]">
        {/* Section heading */}
        <div className="flex items-center justify-between border-b border-[#eee5e4] px-6 py-5">
          <div>
            <h3 className="font-serif text-2xl font-semibold text-[#293244]">
              Order Items
            </h3>

            <p className="mt-1 text-sm text-[#9aa0ab]">
              {order.items.length} total{" "}
              {order.items.length === 1
                ? "item"
                : "items"}
            </p>
          </div>

          <button
            onClick={() =>
              setShowAddItem((current) => !current)
            }
            className="flex items-center gap-2 rounded-xl bg-[#f4e9ed] px-5 py-3 text-sm font-medium text-[#79576a] transition hover:bg-[#eddee3]"
          >
            {showAddItem ? (
              <X size={17} />
            ) : (
              <Plus size={17} />
            )}

            {showAddItem ? "Close" : "Add Item"}
          </button>
        </div>

        {/* Add item form */}
        {showAddItem && (
          <div className="border-b border-[#eee5e4] bg-[#fdfafa] px-6 py-6">
            <div className="mb-5">
              <h4 className="font-serif text-xl font-semibold text-[#293244]">
                Add New Item
              </h4>

              <p className="mt-1 text-sm text-[#999faa]">
                Add another dish or beverage to this order.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[2fr_0.6fr_0.8fr_auto] lg:items-end">
              {/* Item name */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#8d95a3]">
                  Item Name
                </label>

                <input
                  type="text"
                  value={itemName}
                  onChange={(e) =>
                    setItemName(e.target.value)
                  }
                  placeholder="e.g. Dosa"
                  className="w-full rounded-xl border border-[#e3d9d9] bg-white px-4 py-3 text-sm text-[#303747] outline-none transition placeholder:text-[#b4bac4] focus:border-[#9a7485]"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#8d95a3]">
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "") {
                      setItemQuantity("");
                      return;
                    }

                    setItemQuantity(Number(value));
                  }}
                  className="w-full rounded-xl border border-[#e3d9d9] bg-white px-4 py-3 text-sm text-[#303747] outline-none transition focus:border-[#9a7485]"
                />
              </div>

              {/* Unit price */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#8d95a3]">
                  Unit Price
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8e96a5]">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={itemPrice}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (value === "") {
                        setItemPrice("");
                        return;
                      }

                      setItemPrice(Number(value));
                    }}
                    className="w-full rounded-xl border border-[#e3d9d9] bg-white py-3 pl-8 pr-4 text-sm text-[#303747] outline-none transition focus:border-[#9a7485]"
                  />
                </div>
              </div>

              {/* Add */}
              <button
                onClick={handleAddItem}
                disabled={addingItem}
                className="flex h-[46px] items-center justify-center gap-2 rounded-xl bg-[#79576a] px-6 text-sm font-medium text-white transition hover:bg-[#694a5b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addingItem ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Plus size={17} />
                )}

                Add
              </button>
            </div>

            {/* Preview */}
            <div className="mt-4 text-right text-sm text-[#8e96a5]">
              Preview:{" "}
              <span className="font-medium text-[#475062]">
                {formatCurrency(previewTotal)}
              </span>
            </div>
          </div>
        )}

        {/* Existing items */}
        <div>
          {order.items.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5edef] text-[#79576a]">
                <UtensilsCrossed size={21} />
              </div>

              <p className="mt-4 font-medium text-[#4b5361]">
                No items in this order
              </p>

              <p className="mt-1 text-sm text-[#9aa0ab]">
                Add an item using the form above.
              </p>
            </div>
          ) : (
            order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-[#eee5e4] px-6 py-5 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f6eef1] text-[#79576a]">
                    <UtensilsCrossed
                      size={20}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#303747]">
                      {item.itemName}
                    </p>

                    <p className="mt-1 text-sm text-[#9aa0ab]">
                      {item.quantity} ×{" "}
                      {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <p className="font-medium text-[#303747]">
                    {formatCurrency(item.totalPrice)}
                  </p>

                  <button
                    onClick={() =>
                      handleDeleteItem(item.id)
                    }
                    disabled={
                      deletingItemId === item.id
                    }
                    title="Delete item"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9ba5b5] transition hover:bg-[#f7eeee] hover:text-[#9b6464] disabled:opacity-40"
                  >
                    {deletingItemId === item.id ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-[#eee5e4] bg-[#fdfafa] px-6 py-5">
          <div className="ml-auto max-w-md">
            <div className="flex items-center justify-between border-b border-[#e7dede] pb-3 text-sm text-[#7e8694]">
              <span>Items</span>
              <span>{order.itemCount}</span>
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="text-lg font-medium text-[#293244]">
                Total
              </span>

              <span className="font-serif text-2xl font-semibold text-[#293244]">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


// =========================================================
// INFO FIELD
// =========================================================

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-[#a0a6b0]">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-[#3e4655]">
        {value}
      </p>
    </div>
  );
}


// =========================================================
// NEW ORDER
// =========================================================

function NewOrder() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>(
    []
  );

  const [loadingCustomers, setLoadingCustomers] =
    useState(true);

  const [customerMode, setCustomerMode] = useState<
    "existing" | "new"
  >("existing");

  const [selectedCustomerId, setSelectedCustomerId] =
    useState("");

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [items, setItems] = useState<
    {
      itemName: string;
      quantity: number | "";
      unitPrice: number | "";
    }[]
  >([
    {
      itemName: "",
      quantity: 1,
      unitPrice: "",
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoadingCustomers(true);

        const result = await apiClient<{
          data: Customer[];
        }>("/customers?page=1&size=100");

        setCustomers(result.data);

        if (result.data.length > 0) {
          setSelectedCustomerId(result.data[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load customers."
        );
      } finally {
        setLoadingCustomers(false);
      }
    }

    loadCustomers();
  }, []);

  const total = items.reduce((sum, item) => {
    if (
      item.quantity === "" ||
      item.unitPrice === ""
    ) {
      return sum;
    }

    return (
      sum +
      Number(item.quantity) * Number(item.unitPrice)
    );
  }, 0);

  function updateItem(
    index: number,
    field: "itemName" | "quantity" | "unitPrice",
    value: string
  ) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        if (field === "itemName") {
          return {
            ...item,
            itemName: value,
          };
        }

        if (value === "") {
          return {
            ...item,
            [field]: "",
          };
        }

        return {
          ...item,
          [field]: Number(value),
        };
      })
    );
  }

  function addBlankItem() {
    setItems((current) => [
      ...current,
      {
        itemName: "",
        quantity: 1,
        unitPrice: "",
      },
    ]);
  }

  function removeItem(index: number) {
    if (items.length === 1) return;

    setItems((current) =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  async function handleSubmit() {
    setError("");

    if (customerMode === "existing") {
      if (!selectedCustomerId) {
        setError("Please select a customer.");
        return;
      }
    } else {
      if (!newCustomer.name.trim()) {
        setError("Customer name is required.");
        return;
      }

      if (!newCustomer.phone.trim()) {
        setError("Customer phone is required.");
        return;
      }
    }

    if (items.length === 0) {
      setError("Please add at least one item.");
      return;
    }

    for (const item of items) {
      if (!item.itemName.trim()) {
        setError("Every item must have a name.");
        return;
      }

      if (
        item.quantity === "" ||
        Number(item.quantity) < 1
      ) {
        setError(
          "Every item must have a quantity of at least 1."
        );
        return;
      }

      if (
        item.unitPrice === "" ||
        !Number.isFinite(Number(item.unitPrice)) ||
        Number(item.unitPrice) <= 0
      ) {
        setError(
          "Every item must have a price greater than 0."
        );
        return;
      }
    }

    try {
      setSubmitting(true);

      const customer =
        customerMode === "existing"
          ? {
              id: selectedCustomerId,
              name:
                customers.find(
                  (customer) =>
                    customer.id === selectedCustomerId
                )?.name ?? "",
              email:
                customers.find(
                  (customer) =>
                    customer.id === selectedCustomerId
                )?.email ?? null,
              phone:
                customers.find(
                  (customer) =>
                    customer.id === selectedCustomerId
                )?.phone ?? "",
            }
          : {
              id: null,
              name: newCustomer.name.trim(),
              email:
                newCustomer.email.trim() || null,
              phone: newCustomer.phone.trim(),
            };

      const response = await apiClient<{
        data?: Order;
      }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          customer,
          items: items.map((item) => ({
            itemName: item.itemName.trim(),
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          })),
        }),
      });

      const orderId = response?.data?.id;

      if (!orderId) {
        console.error(
          "Create order response:",
          response
        );

        throw new Error(
          "Order was created, but the server response does not contain an order ID."
        );
      }

      navigate(`/orders/${orderId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create order."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      {/* Back */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-sm font-medium text-[#79576a]"
      >
        <ArrowLeft size={17} />
        Back to orders
      </button>

      {/* Header */}
      <section>
        <p className="mb-2 text-sm uppercase tracking-[0.18em] text-[#a17889]">
          New Order
        </p>

        <h2 className="font-serif text-4xl font-semibold tracking-tight text-[#263044]">
          Create an Order
        </h2>

        <p className="mt-2 text-[#9299a6]">
          Add customer information and order items.
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-[#ead2d2] bg-[#fcf1f1] px-4 py-3 text-sm text-[#936161]">
          {error}
        </div>
      )}

      {/* Customer */}
      <section className="rounded-2xl border border-[#e9dfe0] bg-white p-6 shadow-[0_8px_28px_rgba(62,44,50,0.04)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4ebee] text-[#79576a]">
            <Users size={20} />
          </div>

          <div>
            <h3 className="font-serif text-2xl font-semibold text-[#293244]">
              Customer
            </h3>

            <p className="text-sm text-[#999faa]">
              Choose an existing customer or create a new one.
            </p>
          </div>
        </div>

        {/* Customer mode */}
        <div className="mt-6 flex gap-2 rounded-xl bg-[#f8f4f3] p-1">
          <button
            onClick={() =>
              setCustomerMode("existing")
            }
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              customerMode === "existing"
                ? "bg-white text-[#79576a] shadow-sm"
                : "text-[#9299a6]"
            }`}
          >
            Existing Customer
          </button>

          <button
            onClick={() =>
              setCustomerMode("new")
            }
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              customerMode === "new"
                ? "bg-white text-[#79576a] shadow-sm"
                : "text-[#9299a6]"
            }`}
          >
            New Customer
          </button>
        </div>

        {customerMode === "existing" ? (
          <div className="mt-5">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#8d95a3]">
              Select Customer
            </label>

            <select
              disabled={loadingCustomers}
              value={selectedCustomerId}
              onChange={(e) =>
                setSelectedCustomerId(e.target.value)
              }
              className="w-full rounded-xl border border-[#e3d9d9] bg-white px-4 py-3 text-sm text-[#303747] outline-none focus:border-[#9a7485]"
            >
              {loadingCustomers ? (
                <option>Loading customers...</option>
              ) : customers.length === 0 ? (
                <option value="">
                  No customers available
                </option>
              ) : (
                customers.map((customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name} — {customer.phone}
                  </option>
                ))
              )}
            </select>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <InputField
              label="Name"
              value={newCustomer.name}
              onChange={(value) =>
                setNewCustomer((current) => ({
                  ...current,
                  name: value,
                }))
              }
              placeholder="Customer name"
            />

            <InputField
              label="Phone"
              value={newCustomer.phone}
              onChange={(value) =>
                setNewCustomer((current) => ({
                  ...current,
                  phone: value,
                }))
              }
              placeholder="Phone number"
            />

            <InputField
              label="Email"
              value={newCustomer.email}
              onChange={(value) =>
                setNewCustomer((current) => ({
                  ...current,
                  email: value,
                }))
              }
              placeholder="Email (optional)"
            />
          </div>
        )}
      </section>

      {/* Items */}
      <section className="rounded-2xl border border-[#e9dfe0] bg-white shadow-[0_8px_28px_rgba(62,44,50,0.04)]">
        <div className="flex items-center justify-between border-b border-[#eee5e4] px-6 py-5">
          <div>
            <h3 className="font-serif text-2xl font-semibold text-[#293244]">
              Order Items
            </h3>

            <p className="mt-1 text-sm text-[#999faa]">
              Add the dishes and beverages for this order.
            </p>
          </div>

          <button
            onClick={addBlankItem}
            className="flex items-center gap-2 rounded-xl bg-[#f4e9ed] px-4 py-2.5 text-sm font-medium text-[#79576a]"
          >
            <Plus size={17} />
            Add Item
          </button>
        </div>

        <div className="space-y-4 p-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-[#eee4e3] bg-[#fdfafa] p-4"
            >
              <div className="grid gap-4 md:grid-cols-[2fr_0.7fr_0.9fr_auto] md:items-end">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#8d95a3]">
                    Item Name
                  </label>

                  <input
                    value={item.itemName}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "itemName",
                        e.target.value
                      )
                    }
                    placeholder="e.g. Paneer Tikka"
                    className="w-full rounded-xl border border-[#e3d9d9] bg-white px-4 py-3 text-sm outline-none focus:border-[#9a7485]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#8d95a3]">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-[#e3d9d9] bg-white px-4 py-3 text-sm outline-none focus:border-[#9a7485]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#8d95a3]">
                    Unit Price
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8e96a5]">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "unitPrice",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-[#e3d9d9] bg-white py-3 pl-8 pr-4 text-sm outline-none focus:border-[#9a7485]"
                    />
                  </div>
                </div>

                <button
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="flex h-[46px] w-[46px] items-center justify-center rounded-xl text-[#9ba5b5] hover:bg-[#f8eeee] hover:text-[#986666] disabled:cursor-not-allowed disabled:opacity-30"
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t border-[#eee5e4] bg-[#fdfafa] px-6 py-5">
          <div className="ml-auto flex max-w-sm items-center justify-between">
            <span className="text-sm text-[#858d9b]">
              Order Total
            </span>

            <span className="font-serif text-2xl font-semibold text-[#293244]">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate("/")}
          className="rounded-xl border border-[#dfd4d4] bg-white px-5 py-3 text-sm font-medium text-[#737b89]"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-[#79576a] px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#694a5b] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && (
            <Loader2
              size={17}
              className="animate-spin"
            />
          )}

          Create Order
        </button>
      </div>
    </div>
  );
}


// =========================================================
// INPUT FIELD
// =========================================================

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#8d95a3]">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#e3d9d9] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#b4bac4] focus:border-[#9a7485]"
      />
    </div>
  );
}


// =========================================================
// STATES
// =========================================================

function LoadingState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-[#8f97a5]">
        <Loader2
          size={20}
          className="animate-spin text-[#79576a]"
        />
        Loading...
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[250px] items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f8eded] text-[#986666]">
          <X size={21} />
        </div>

        <p className="mt-4 font-medium text-[#4b5361]">
          Something went wrong
        </p>

        <p className="mt-1 text-sm text-[#999faa]">
          {message}
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5edef] text-[#79576a]">
          <ClipboardList size={21} />
        </div>

        <p className="mt-4 font-medium text-[#4b5361]">
          No orders found
        </p>

        <p className="mt-1 text-sm text-[#999faa]">
          Try changing your search or filter.
        </p>
      </div>
    </div>
  );
}


// =========================================================
// APP
// =========================================================

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route
            path="/orders/new"
            element={<NewOrder />}
          />

          <Route
            path="/orders/:id"
            element={<OrderDetails />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;